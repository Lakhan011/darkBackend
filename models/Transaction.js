const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['PAYMENT', 'REFUND', 'WALLET_CREDIT', 'WALLET_DEBIT'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  gateway: { type: String, enum: ['RAZORPAY', 'COD', 'WALLET'] },
  gatewayTransactionId: String,
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'], required: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
