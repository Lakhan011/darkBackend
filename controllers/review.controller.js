const reviewService = require('../services/review.service');
const responseHelper = require('../helpers/response.helper');
const logger = require('../utils/logger');

class ReviewController {
  async getProductReviews(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await reviewService.getProductReviews(req.params.productId, parseInt(page), parseInt(limit));
      return responseHelper.paginatedResponse(res, 'Reviews fetched', data.reviews, data.total, data.page, data.totalPages);
    } catch (error) {
      logger.error(`Get Reviews Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async addReview(req, res) {
    try {
      const { orderId, ...reviewData } = req.body;
      const data = await reviewService.addReview(req.user.id, req.params.productId, orderId, reviewData);
      return responseHelper.successResponse(res, 'Review added successfully', data, 201);
    } catch (error) {
      logger.error(`Add Review Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async updateReview(req, res) {
    try {
      const data = await reviewService.updateReview(req.params.reviewId, req.user.id, req.body);
      return responseHelper.successResponse(res, 'Review updated successfully', data);
    } catch (error) {
      logger.error(`Update Review Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async deleteReview(req, res) {
    try {
      await reviewService.deleteReview(req.params.reviewId, req.user.id, req.user.role);
      return responseHelper.successResponse(res, 'Review deleted successfully');
    } catch (error) {
      logger.error(`Delete Review Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async voteHelpful(req, res) {
    try {
      const data = await reviewService.voteHelpful(req.params.reviewId, req.user.id);
      return responseHelper.successResponse(res, 'Vote recorded', data);
    } catch (error) {
      logger.error(`Vote Review Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async moderateReview(req, res) {
    try {
      const { status } = req.body;
      const data = await reviewService.moderateReview(req.params.reviewId, status);
      return responseHelper.successResponse(res, 'Review moderated', data);
    } catch (error) {
      logger.error(`Moderate Review Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new ReviewController();
