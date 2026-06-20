const cartService = require('../services/cart.service');
const responseHelper = require('../helpers/response.helper');
const logger = require('../utils/logger');

class CartController {
  async getCart(req, res) {
    try {
      const userId = req.user.id || req.user._id;
      const data = await cartService.getCart(userId);
      return responseHelper.successResponse(res, 'Cart fetched successfully', data);
    } catch (error) {
      logger.error(`Get Cart Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async addToCart(req, res) {
    try {
      const fs = require('fs');
      fs.writeFileSync('f:/OneDrive/Desktop/darkBackend/debug-cart.json', JSON.stringify({ user: req.user, body: req.body }));

      const userId = req.user?.id || req.user?._id || req.user?.userId || req.user?.user?._id;
      const { productId, quantity = 1, variantOption } = req.body;

      if (!userId || !productId) {
         return responseHelper.errorResponse(res, `Missing data. req.user: ${JSON.stringify(req.user)}, req.body: ${JSON.stringify(req.body)}`, 400);
      }

      const data = await cartService.addToCart(userId, productId, quantity, variantOption);
      return responseHelper.successResponse(res, 'Item added to cart', data);
    } catch (error) {
      logger.error(`Add to Cart Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async updateCartItem(req, res) {
    try {
      const userId = req.user.id || req.user._id;
      const { quantity } = req.body;
      const data = await cartService.updateCartItem(userId, req.params.itemId, quantity);
      return responseHelper.successResponse(res, 'Cart item updated', data);
    } catch (error) {
      logger.error(`Update Cart Item Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async removeFromCart(req, res) {
    try {
      const userId = req.user.id || req.user._id;
      const data = await cartService.removeFromCart(userId, req.params.itemId);
      return responseHelper.successResponse(res, 'Item removed from cart', data);
    } catch (error) {
      logger.error(`Remove from Cart Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async clearCart(req, res) {
    try {
      const userId = req.user.id || req.user._id;
      await cartService.clearCart(userId);
      return responseHelper.successResponse(res, 'Cart cleared successfully');
    } catch (error) {
      logger.error(`Clear Cart Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async applyCoupon(req, res) {
    try {
      const userId = req.user.id || req.user._id;
      const { couponCode } = req.body;
      const data = await cartService.applyCoupon(userId, couponCode);
      return responseHelper.successResponse(res, 'Coupon applied', data);
    } catch (error) {
      logger.error(`Apply Coupon Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async removeCoupon(req, res) {
    try {
      const userId = req.user.id || req.user._id;
      const data = await cartService.removeCoupon(userId);
      return responseHelper.successResponse(res, 'Coupon removed', data);
    } catch (error) {
      logger.error(`Remove Coupon Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getCartSummary(req, res) {
    try {
      const userId = req.user.id || req.user._id;
      const data = await cartService.getCartSummary(userId);
      return responseHelper.successResponse(res, 'Cart summary fetched', data);
    } catch (error) {
      logger.error(`Cart Summary Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new CartController();
