const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const crypto = require('crypto');

const generateOrderId = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${date}-${random}`;
};

class OrderService {
  async placeOrder(userId, orderData) {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    let subtotal = 0;
    const orderItems = [];

    // Deduct stock and build items
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product ? product.name : 'a product'}`);
      }
      
      product.stock -= item.quantity;
      product.salesCount += item.quantity;
      await product.save();

      const price = product.price;
      subtotal += price * item.quantity;
      
      orderItems.push({
        product: product._id,
        seller: product.seller,
        quantity: item.quantity,
        price,
        variantOption: item.variantOption
      });
    }

    const discount = cart.discount || 0;
    const tax = (subtotal - discount) * 0.18; // Example tax
    const shipping = subtotal > 500 ? 0 : 50;
    const totalAmount = subtotal - discount + tax + shipping;

    const orderId = generateOrderId();

    const order = new Order({
      orderId,
      user: userId,
      items: orderItems,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress || orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      subtotal,
      discount,
      tax,
      shippingFee: shipping,
      totalAmount,
      couponApplied: cart.coupon,
      timeline: [{ status: 'PENDING', comment: 'Order placed' }]
    });

    await order.save();

    // Clear cart
    cart.items = [];
    cart.coupon = undefined;
    cart.discount = 0;
    await cart.save();

    return order;
  }

  async getMyOrders(userId, page = 1, limit = 10, status) {
    const query = { user: userId };
    if (status) query.orderStatus = status;

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('items.product', 'name images')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getOrderById(orderId, userId) {
    const query = { _id: orderId };
    if (userId) query.user = userId; // Admin might not pass userId

    const order = await Order.findOne(query)
      .populate('items.product')
      .populate('items.seller', 'storeName name');

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    return order;
  }

  async cancelOrder(orderId, userId, reason) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new Error('Order not found');

    if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
      throw new Error(`Cannot cancel order in ${order.orderStatus} status`);
    }

    order.orderStatus = 'CANCELLED';
    order.timeline.push({ status: 'CANCELLED', comment: reason || 'Cancelled by user' });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, salesCount: -item.quantity }
      });
    }

    await order.save();
    return order;
  }

  async requestReturn(orderId, userId, reason, images) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new Error('Order not found');

    if (order.orderStatus !== 'DELIVERED') {
      throw new Error('Can only return delivered orders');
    }

    order.orderStatus = 'RETURN_REQUESTED';
    order.timeline.push({ status: 'RETURN_REQUESTED', comment: reason });
    // Save images if any, could be attached to order document if schema supports
    
    await order.save();
    return order;
  }

  async updateOrderStatus(orderId, status, updatedByComment) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    order.orderStatus = status;
    order.timeline.push({ status, comment: updatedByComment });

    if (status === 'DELIVERED') {
      order.paymentStatus = 'COMPLETED'; // If COD
    }

    await order.save();
    return order;
  }
}

module.exports = new OrderService();
