const orderService = require('../services/order.service');
const responseHelper = require('../helpers/response.helper');
const logger = require('../utils/logger');

class OrderController {
  async placeOrder(req, res) {
    try {
      const data = await orderService.placeOrder(req.user.id, req.body);
      return responseHelper.successResponse(res, 'Order placed successfully', data, 201);
    } catch (error) {
      logger.error(`Place Order Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getMyOrders(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const data = await orderService.getMyOrders(req.user.id, parseInt(page), parseInt(limit), status);
      return responseHelper.paginatedResponse(res, 'Orders fetched', data.orders, data.total, data.page, data.totalPages);
    } catch (error) {
      logger.error(`Get My Orders Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getOrderById(req, res) {
    try {
      const data = await orderService.getOrderById(req.params.orderId, req.user.id);
      return responseHelper.successResponse(res, 'Order details fetched', data);
    } catch (error) {
      logger.error(`Get Order By Id Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async cancelOrder(req, res) {
    try {
      const { reason } = req.body;
      const data = await orderService.cancelOrder(req.params.orderId, req.user.id, reason);
      return responseHelper.successResponse(res, 'Order cancelled', data);
    } catch (error) {
      logger.error(`Cancel Order Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async requestReturn(req, res) {
    try {
      const { reason, images } = req.body;
      const data = await orderService.requestReturn(req.params.orderId, req.user.id, reason, images);
      return responseHelper.successResponse(res, 'Return requested', data);
    } catch (error) {
      logger.error(`Request Return Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new OrderController();
