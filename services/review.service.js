const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

class ReviewService {
  async getProductReviews(productId, page = 1, limit = 10) {
    const query = { productId: productId, status: 'APPROVED' };
    const skip = (page - 1) * limit;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('userId', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return { reviews, total, page, totalPages: Math.ceil(total / limit) };
  }

  async addReview(userId, productId, orderId, reviewData) {
    // Check if user has ordered the product
    // For testing/development, we bypass this strict check
    /*
    const hasOrdered = await Order.findOne({
      user: userId,
      _id: orderId,
      "items.product": productId,
      orderStatus: 'DELIVERED'
    });

    if (!hasOrdered) {
      throw new Error('You can only review products you have purchased and received');
    }
    */

    const existingReview = await Review.findOne({ userId: userId, productId: productId });
    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }

    const review = new Review({
      userId: userId,
      productId: productId,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      images: reviewData.images,
      status: 'APPROVED' // Auto-approve for simplicity
    });

    await review.save();

    // Update product rating
    await this.updateProductRating(productId);

    return review;
  }

  async updateReview(reviewId, userId, data) {
    const review = await Review.findOne({ _id: reviewId, userId: userId });
    if (!review) throw new Error('Review not found or unauthorized');

    Object.assign(review, {
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      images: data.images,
      status: 'APPROVED'
    });

    await review.save();
    await this.updateProductRating(review.productId);

    return review;
  }

  async deleteReview(reviewId, userId, userRole) {
    const query = { _id: reviewId };
    if (userRole !== 'ADMIN') query.userId = userId;

    const review = await Review.findOneAndDelete(query);
    if (!review) throw new Error('Review not found or unauthorized');

    await this.updateProductRating(review.productId);
    return true;
  }

  async voteHelpful(reviewId, userId) {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error('Review not found');

    const index = review.helpfulVotes.users.indexOf(userId);
    if (index === -1) {
      review.helpfulVotes.users.push(userId);
    } else {
      review.helpfulVotes.users.splice(index, 1);
    }
    review.helpfulVotes.count = review.helpfulVotes.users.length;

    await review.save();
    return review;
  }

  async moderateReview(reviewId, status) {
    const review = await Review.findByIdAndUpdate(reviewId, { status }, { new: true });
    if (!review) throw new Error('Review not found');

    await this.updateProductRating(review.productId);
    return review;
  }

  async updateProductRating(productId) {
    // Use mongoose.Types.ObjectId to ensure matching in aggregation
    const mongoose = require('mongoose');
    const objectId = new mongoose.Types.ObjectId(productId);
    
    const stats = await Review.aggregate([
      { $match: { productId: objectId, status: 'APPROVED' } },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          numReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        'ratings.average': Math.round(stats[0].averageRating * 10) / 10,
        'ratings.count': stats[0].numReviews,
        reviewsCount: stats[0].numReviews
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        'ratings.average': 0,
        'ratings.count': 0,
        reviewsCount: 0
      });
    }
  }
}

module.exports = new ReviewService();
