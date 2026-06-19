const notificationService = require('../services/notification.service');
const responseHelper = require('../helpers/response.helper');
const logger = require('../utils/logger');

class NotificationController {
  async getMyNotifications(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await notificationService.getMyNotifications(req.user.id, parseInt(page), parseInt(limit));
      return responseHelper.paginatedResponse(res, 'Notifications fetched', data.notifications, data.total, data.page, data.totalPages);
    } catch (error) {
      logger.error(`Get Notifications Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async markAsRead(req, res) {
    try {
      const data = await notificationService.markAsRead(req.params.id, req.user.id);
      return responseHelper.successResponse(res, 'Notification marked as read', data);
    } catch (error) {
      logger.error(`Mark Notification Read Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async markAllAsRead(req, res) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      return responseHelper.successResponse(res, 'All notifications marked as read');
    } catch (error) {
      logger.error(`Mark All Read Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getUnreadCount(req, res) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);
      return responseHelper.successResponse(res, 'Unread count fetched', { count });
    } catch (error) {
      logger.error(`Get Unread Count Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new NotificationController();
