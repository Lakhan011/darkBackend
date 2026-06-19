const cartService = require('../services/cart.service');
const responseHelper = require('../helpers/response.helper');
const logger = require('../utils/logger');

class CartController {
  async getCart(req, res) {
    try {
      const data = await cartService.getCart(req.user.id);
      return responseHelper.successResponse(res, 'Cart fetched successfully', data);
    } catch (error) {
      logger.error(`Get Cart Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async addToCart(req, res) {
    try {
      const { productId, quantity = 1, variantOption } = req.body;
      const data = await cartService.addToCart(req.user.id, productId, quantity, variantOption);
      return responseHelper.successResponse(res, 'Item added to cart', data);
    } catch (error) {
      logger.error(`Add to Cart Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async updateCartItem(req, res) {
    try {
      const { quantity } = req.body;
      const data = await cartService.updateCartItem(req.user.id, req.params.itemId, quantity);
      return responseHelper.successResponse(res, 'Cart item updated', data);
    } catch (error) {
      logger.error(`Update Cart Item Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async removeFromCart(req, res) {
    try {
      const data = await cartService.removeFromCart(req.user.id, req.params.itemId);
      return responseHelper.successResponse(res, 'Item removed from cart', data);
    } catch (error) {
      logger.error(`Remove from Cart Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async clearCart(req, res) {
    try {
      await cartService.clearCart(req.user.id);
      return responseHelper.successResponse(res, 'Cart cleared successfully');
    } catch (error) {
      logger.error(`Clear Cart Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async applyCoupon(req, res) {
    try {
      const { couponCode } = req.body;
      const data = await cartService.applyCoupon(req.user.id, couponCode);
      return responseHelper.successResponse(res, 'Coupon applied', data);
    } catch (error) {
      logger.error(`Apply Coupon Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async removeCoupon(req, res) {
    try {
      const data = await cartService.removeCoupon(req.user.id);
      return responseHelper.successResponse(res, 'Coupon removed', data);
    } catch (error) {
      logger.error(`Remove Coupon Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getCartSummary(req, res) {
    try {
      const data = await cartService.getCartSummary(req.user.id);
      return responseHelper.successResponse(res, 'Cart summary fetched', data);
    } catch (error) {
      logger.error(`Cart Summary Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new CartController();
