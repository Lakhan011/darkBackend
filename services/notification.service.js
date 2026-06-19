const Notification = require('../models/Notification');

class NotificationService {
  async createNotification(userId, type, channel, title, message, data = {}) {
    const notification = new Notification({
      user: userId,
      type,
      channel,
      title,
      message,
      data
    });
    await notification.save();
    return notification;
  }

  async getMyNotifications(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const total = await Notification.countDocuments({ user: userId });
    const notifications = await Notification.find({ user: userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) throw new Error('Notification not found');
    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
    return true;
  }

  async getUnreadCount(userId) {
    return Notification.countDocuments({ user: userId, isRead: false });
  }
}

module.exports = new NotificationService();
