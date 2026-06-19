const mongoose = require('mongoose');

const orderStatusEnum = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 
  'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 
  'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'
];

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productName: String,
    thumbnail: String,
    variantId: mongoose.Schema.Types.ObjectId,
    variantOption: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    itemStatus: { type: String, enum: orderStatusEnum, default: 'PENDING' }
  }],
  shippingAddress: {
    name: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  billingAddress: {
    name: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  orderStatus: { type: String, enum: orderStatusEnum, default: 'PENDING' },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND'], default: 'PENDING' },
  paymentMethod: { type: String, enum: ['RAZORPAY', 'COD', 'WALLET', 'UPI'] },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  couponCode: String,
  couponDiscount: { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  refundAmount: { type: Number, default: 0 },
  deliveryBoyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trackingNumber: String,
  deliveryNotes: String,
  invoiceUrl: String,
  cancellationReason: String,
  returnReason: String,
  returnImages: [String],
  timeline: [{
    status: { type: String },
    description: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  estimatedDelivery: Date,
  deliveredAt: Date
}, {
  timestamps: true
});

orderSchema.index({ customerId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
