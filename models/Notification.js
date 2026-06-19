const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['ORDER', 'PAYMENT', 'DELIVERY', 'PROMOTION', 'SYSTEM', 'WISHLIST'], required: true },
  channel: { type: String, enum: ['IN_APP', 'EMAIL', 'SMS', 'PUSH'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
  readAt: Date
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
