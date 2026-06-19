const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');

// Lazy-load Razorpay so placeholder env vars don't crash the server on startup
let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id') {
      throw new Error('Razorpay KEY_ID is not configured. Please set RAZORPAY_KEY_ID in your .env file.');
    }
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return _razorpay;
};

class PaymentService {
  async createRazorpayOrder(amount, orderId) {
    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: orderId.toString()
    };
    
    // Call the real Razorpay API
    const order = await getRazorpay().orders.create(options);
    return order;
  }

  async verifyRazorpayPayment(razorpayOrderId, paymentId, signature, orderId) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error('Razorpay secret is not configured');

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpayOrderId + "|" + paymentId)
      .digest('hex');

    // Strict validation
    if (generatedSignature !== signature) {
      throw new Error('Invalid Razorpay signature. Payment verification failed.');
    }

    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    order.paymentStatus = 'PAID';
    order.paymentMethod = 'RAZORPAY';
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = paymentId;
    order.razorpaySignature = signature;
    order.timeline.push({ status: order.orderStatus, comment: 'Payment verified and completed successfully.' });
    
    await order.save();

    return order;
  }

  async initiateRefund(paymentId, amount, notes) {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // amount in paise
      notes
    });
    return refund;
  }

  async handleCODOrder(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    order.paymentStatus = 'PENDING';
    order.paymentMethod = 'COD';
    order.timeline.push({ status: order.orderStatus, comment: 'COD Order placed successfully.' });
    await order.save();

    return order;
  }
}

module.exports = new PaymentService();
