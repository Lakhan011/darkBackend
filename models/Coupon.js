const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true, uppercase: true },
  type: { type: String, enum: ['PERCENTAGE', 'FLAT', 'FREE_SHIPPING', 'BOGO'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscountAmount: Number,
  minimumOrderAmount: { type: Number, default: 0 },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  usageLimit: Number,
  usageLimitPerUser: Number,
  usageCount: { type: Number, default: 0 },
  usedBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date, default: Date.now }
  }],
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);
