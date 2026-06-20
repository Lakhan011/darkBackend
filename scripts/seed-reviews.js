const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Load .env file

const Review = require('../models/Review');
const User = require('../models/User');
const Product = require('../models/Product');

const MONGO_URI = 'mongodb://127.0.0.1:27017/ecommerce';

const reviewTitles = [
  "Excellent product!", "Very satisfied", "Not what I expected", 
  "Great quality", "Would buy again", "Average, nothing special",
  "Highly recommended", "Terrible", "Amazing value", "Fast delivery, good item"
];

const reviewComments = [
  "I am thoroughly impressed by the quality of this item. It works exactly as described and feels very premium.",
  "It's decent for the price. Does what it needs to do but don't expect a miracle.",
  "Absolutely terrible. Broke within the first two days of using it. Do not recommend.",
  "Very good! I bought this as a gift and they loved it.",
  "Fast shipping and the product was well packaged. The item itself is fantastic.",
  "I've seen better, but it's okay for everyday use.",
  "Wow! Honestly surprised by how good this is. Worth every penny.",
  "Could be better. The material feels a bit cheap in my hands.",
  "Perfect! Just what I was looking for.",
  "I'll probably return this. It doesn't look like the pictures at all."
];

async function seedReviews() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for Seeding Reviews');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    // Ensure we have some users
    let users = await User.find({}).limit(10);
    if (users.length === 0) {
      console.log('No users found, creating mock users...');
      const mockUsers = Array.from({ length: 5 }).map((_, i) => ({
        name: `Reviewer User ${i+1}`,
        email: `reviewer${i+1}@example.com`,
        password: 'password123',
        role: 'USER',
        isEmailVerified: true
      }));
      users = await User.insertMany(mockUsers);
    }
    console.log(`Using ${users.length} users for reviews`);

    // Delete existing reviews
    await Review.deleteMany({});
    console.log('Deleted existing reviews');

    let totalReviewsAdded = 0;

    for (const product of products) {
      // Add 3 to 8 reviews per product
      const numReviews = Math.floor(Math.random() * 6) + 3; 
      
      let sumRating = 0;
      
      for (let i = 0; i < numReviews; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const rating = Math.floor(Math.random() * 5) + 1; // 1 to 5
        const titleIndex = Math.floor(Math.random() * reviewTitles.length);
        const commentIndex = Math.floor(Math.random() * reviewComments.length);
        
        // Prevent duplicate user reviews on same product
        const existing = await Review.findOne({ productId: product._id, userId: randomUser._id });
        if (existing) continue;

        await Review.create({
          productId: product._id,
          userId: randomUser._id,
          rating: rating,
          title: reviewTitles[titleIndex],
          comment: reviewComments[commentIndex],
          status: 'APPROVED',
          isVerifiedPurchase: Math.random() > 0.5
        });

        sumRating += rating;
        totalReviewsAdded++;
      }

      // Update product rating
      const actualReviewsCount = await Review.countDocuments({ productId: product._id });
      const avgRating = actualReviewsCount > 0 ? (sumRating / actualReviewsCount) : 0;
      
      await Product.findByIdAndUpdate(product._id, {
        'ratings.average': Math.round(avgRating * 10) / 10,
        'ratings.count': actualReviewsCount,
        reviewsCount: actualReviewsCount
      });
    }

    console.log(`Seeding Complete! Added ${totalReviewsAdded} reviews.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedReviews();
