const sellerService = require('../services/seller.service');
const responseHelper = require('../helpers/response.helper');
const logger = require('../utils/logger');

class SellerController {
  async registerStore(req, res) {
    try {
      const data = await sellerService.registerStore(req.user.id, req.body);
      return responseHelper.successResponse(res, 'Store registered. Awaiting admin approval.', data, 201);
    } catch (error) {
      logger.error(`Register Store Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getMyStore(req, res) {
    try {
      const data = await sellerService.getMyStore(req.user.id);
      return responseHelper.successResponse(res, 'Store fetched', data);
    } catch (error) {
      logger.error(`Get Store Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async updateStore(req, res) {
    try {
      const data = await sellerService.updateStore(req.user.id, req.body);
      return responseHelper.successResponse(res, 'Store updated', data);
    } catch (error) {
      logger.error(`Update Store Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getDashboard(req, res) {
    try {
      const data = await sellerService.getSellerDashboard(req.user.id);
      return responseHelper.successResponse(res, 'Dashboard fetched', data);
    } catch (error) {
      logger.error(`Seller Dashboard Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getProducts(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await sellerService.getSellerProducts(req.user.id, parseInt(page), parseInt(limit));
      return responseHelper.paginatedResponse(res, 'Products fetched', data.products, data.total, data.page, data.totalPages);
    } catch (error) {
      logger.error(`Seller Products Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getOrders(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const data = await sellerService.getSellerOrders(req.user.id, parseInt(page), parseInt(limit), status);
      return responseHelper.paginatedResponse(res, 'Orders fetched', data.orders, data.total, data.page, data.totalPages);
    } catch (error) {
      logger.error(`Seller Orders Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      const data = await sellerService.updateOrderStatus(req.user.id, req.params.orderId, status);
      return responseHelper.successResponse(res, 'Order status updated', data);
    } catch (error) {
      logger.error(`Seller Update Order Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async subscribePlan(req, res) {
    try {
      const { planId, planName } = req.body;
      if (!planId || !planName) {
        return responseHelper.errorResponse(res, 'Plan ID and Plan Name are required', 400);
      }
      const data = await sellerService.subscribePlan(req.user.id, planId, planName);
      return responseHelper.successResponse(res, 'Successfully subscribed to plan', data);
    } catch (error) {
      logger.error(`Seller Subscribe Plan Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new SellerController();
