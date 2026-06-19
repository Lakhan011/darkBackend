const paymentService = require('../services/payment.service');
const responseHelper = require('../helpers/response.helper');
const logger = require('../utils/logger');
const Order = require('../models/Order');

class PaymentController {
  async initiatePayment(req, res) {
    try {
      const { orderId } = req.body; // This is the mongo _id of the order
      const order = await Order.findById(orderId);
      if (!order) {
        return responseHelper.errorResponse(res, 'Order not found', 404);
      }

      if (order.paymentMethod === 'COD') {
        const data = await paymentService.handleCODOrder(orderId);
        return responseHelper.successResponse(res, 'COD order confirmed', data);
      }

      const razorpayOrder = await paymentService.createRazorpayOrder(order.totalAmount, order.orderId);
      return responseHelper.successResponse(res, 'Payment initiated', razorpayOrder);
    } catch (error) {
      logger.error(`Initiate Payment Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async verifyPayment(req, res) {
    try {
      const { razorpayOrderId, paymentId, signature, orderId } = req.body;
      const data = await paymentService.verifyRazorpayPayment(razorpayOrderId, paymentId, signature, orderId);
      return responseHelper.successResponse(res, 'Payment verified', data);
    } catch (error) {
      logger.error(`Verify Payment Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async webhook(req, res) {
    try {
      const crypto = require('crypto');
      const Transaction = require('../models/Transaction');

      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!webhookSecret) {
        logger.error('Webhook secret not configured');
        return res.status(500).send('Configuration Error');
      }

      // The exact raw buffer is saved by express.json middleware in app.js
      const rawBody = req.rawBody;
      const signature = req.headers['x-razorpay-signature'];

      if (!signature) {
        return res.status(400).send('Missing signature');
      }

      if (!rawBody) {
        logger.error('Raw body missing. express.json verify function failed.');
        return res.status(500).send('Internal Server Error');
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      // Use timingSafeEqual to prevent timing attacks
      const isAuthentic = crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );

      if (!isAuthentic) {
        logger.warn('Razorpay Webhook: Invalid Signature Detected');
        return res.status(400).send('Invalid signature');
      }

      // Payload is already parsed by express.json into req.body
      const payload = req.body;
      const event = payload.event;
      
      logger.info(`Razorpay Webhook Received: ${event}`);

      // Handle the payment.captured event
      if (event === 'payment.captured') {
        const paymentEntity = payload.payload.payment.entity;
        
        // Find order based on receipt ID (which we set to orderId in createRazorpayOrder)
        // Note: Razorpay receipt is limited in length, but we set it to the mongo Order ID
        const orderId = paymentEntity.notes.orderId || null; 
        
        let order = null;
        
        // If we have an order ID in notes or we can look it up by razorpayOrderId
        // Actually, order creation passes receipt as order._id, but the webhook payload for payment.captured 
        // will contain paymentEntity.order_id which is the RAZORPAY order ID.
        order = await Order.findOne({ razorpayOrderId: paymentEntity.order_id });

        if (order) {
          order.paymentStatus = 'PAID';
          order.timeline.push({ status: order.orderStatus, comment: 'Webhook confirmed payment captured.' });
          await order.save();

          // Log the transaction
          await Transaction.create({
            transactionId: 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            orderId: order._id,
            userId: order.customerId,
            type: 'PAYMENT',
            amount: paymentEntity.amount / 100, // convert back from paise
            currency: paymentEntity.currency,
            gateway: 'RAZORPAY',
            gatewayTransactionId: paymentEntity.id,
            status: 'SUCCESS',
            metadata: payload
          });
        }
      }

      return res.status(200).send('OK');
    } catch (error) {
      logger.error(`Webhook Error: ${error.message}`);
      return res.status(500).send('Webhook Error');
    }
  }

  async refund(req, res) {
    try {
      const { paymentId, amount, notes } = req.body;
      const data = await paymentService.initiateRefund(paymentId, amount, notes);
      return responseHelper.successResponse(res, 'Refund initiated', data);
    } catch (error) {
      logger.error(`Refund Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new PaymentController();
