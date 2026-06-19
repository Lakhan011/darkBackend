const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', unique: true, required: true },
  stockQuantity: { type: Number, default: 0 },
  reservedQuantity: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  isLowStock: { type: Boolean, default: false },
  history: [{
    type: { type: String, enum: ['IN', 'OUT', 'RESERVED', 'CANCELLED'] },
    quantity: Number,
    reason: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

inventorySchema.virtual('availableQuantity').get(function() {
  return this.stockQuantity - this.reservedQuantity;
});

module.exports = mongoose.model('Inventory', inventorySchema);
