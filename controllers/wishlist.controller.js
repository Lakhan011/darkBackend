const wishlistService = require('../services/wishlist.service');
const responseHelper = require('../helpers/response.helper');
const logger = require('../utils/logger');

class WishlistController {
  async getWishlist(req, res) {
    try {
      const data = await wishlistService.getWishlist(req.user.id);
      return responseHelper.successResponse(res, 'Wishlist fetched successfully', data);
    } catch (error) {
      logger.error(`Get Wishlist Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async addToWishlist(req, res) {
    try {
      const { productId } = req.body;
      const data = await wishlistService.addToWishlist(req.user.id, productId);
      return responseHelper.successResponse(res, 'Added to wishlist', data);
    } catch (error) {
      logger.error(`Add to Wishlist Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async removeFromWishlist(req, res) {
    try {
      const { productId } = req.params;
      const data = await wishlistService.removeFromWishlist(req.user.id, productId);
      return responseHelper.successResponse(res, 'Removed from wishlist', data);
    } catch (error) {
      logger.error(`Remove from Wishlist Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async checkInWishlist(req, res) {
    try {
      const { productId } = req.params;
      const isInWishlist = await wishlistService.checkInWishlist(req.user.id, productId);
      return responseHelper.successResponse(res, 'Checked wishlist', { inWishlist: isInWishlist });
    } catch (error) {
      logger.error(`Check Wishlist Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async clearWishlist(req, res) {
    try {
      await wishlistService.clearWishlist(req.user.id);
      return responseHelper.successResponse(res, 'Wishlist cleared');
    } catch (error) {
      logger.error(`Clear Wishlist Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new WishlistController();
