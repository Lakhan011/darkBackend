const adminService = require('../services/admin.service');
const responseHelper = require('../helpers/response.helper');
const logger = require('../utils/logger');

class AdminController {
  async getDashboard(req, res) {
    try {
      const data = await adminService.getDashboardStats();
      return responseHelper.successResponse(res, 'Dashboard stats fetched', data);
    } catch (error) {
      logger.error(`Admin Dashboard Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getRevenueChart(req, res) {
    try {
      const { period } = req.query;
      const data = await adminService.getRevenueChart(period);
      return responseHelper.successResponse(res, 'Revenue chart fetched', data);
    } catch (error) {
      logger.error(`Admin Revenue Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const data = await adminService.getAllUsers(parseInt(page), parseInt(limit), filters);
      return responseHelper.paginatedResponse(res, 'Users fetched', data.users, data.total, data.page, data.totalPages);
    } catch (error) {
      logger.error(`Admin Users Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async blockUser(req, res) {
    try {
      const data = await adminService.blockUser(req.params.id);
      return responseHelper.successResponse(res, 'User blocked', data);
    } catch (error) {
      logger.error(`Admin Block User Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async unblockUser(req, res) {
    try {
      const data = await adminService.unblockUser(req.params.id);
      return responseHelper.successResponse(res, 'User unblocked', data);
    } catch (error) {
      logger.error(`Admin Unblock User Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async deleteUser(req, res) {
    try {
      const data = await adminService.deleteUser(req.params.id);
      return responseHelper.successResponse(res, 'User deleted', data);
    } catch (error) {
      logger.error(`Admin Delete User Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async changeUserRole(req, res) {
    try {
      const { role } = req.body;
      const data = await adminService.changeUserRole(req.params.id, role);
      return responseHelper.successResponse(res, 'Role changed', data);
    } catch (error) {
      logger.error(`Admin Change Role Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getPendingSellers(req, res) {
    try {
      const data = await adminService.getPendingSellers();
      return responseHelper.successResponse(res, 'Pending sellers fetched', data);
    } catch (error) {
      logger.error(`Admin Pending Sellers Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async approveSeller(req, res) {
    try {
      const data = await adminService.approveSeller(req.params.id);
      return responseHelper.successResponse(res, 'Seller approved', data);
    } catch (error) {
      logger.error(`Admin Approve Seller Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async rejectSeller(req, res) {
    try {
      const { reason } = req.body;
      const data = await adminService.rejectSeller(req.params.id, reason);
      return responseHelper.successResponse(res, 'Seller rejected', data);
    } catch (error) {
      logger.error(`Admin Reject Seller Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getAllOrders(req, res) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const data = await adminService.getAllOrders(parseInt(page), parseInt(limit), filters);
      return responseHelper.paginatedResponse(res, 'Orders fetched', data.orders, data.total, data.page, data.totalPages);
    } catch (error) {
      logger.error(`Admin Orders Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getLowStockProducts(req, res) {
    try {
      const data = await adminService.getLowStockProducts();
      return responseHelper.successResponse(res, 'Low stock products fetched', data);
    } catch (error) {
      logger.error(`Admin Low Stock Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new AdminController();
