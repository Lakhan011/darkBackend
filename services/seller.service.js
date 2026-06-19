const SellerStore = require('../models/SellerStore');
const Product = require('../models/Product');
const Order = require('../models/Order');

class SellerService {
  async registerStore(userId, storeData) {
    let store = await SellerStore.findOne({ user: userId });
    if (store) {
      throw new Error('Store already exists for this user');
    }

    store = new SellerStore({
      user: userId,
      ...storeData,
      status: 'PENDING' // Awaiting admin approval
    });

    await store.save();
    return store;
  }

  async getMyStore(userId) {
    const store = await SellerStore.findOne({ user: userId });
    if (!store) {
      throw new Error('Store not found');
    }
    return store;
  }

  async updateStore(userId, data) {
    const store = await SellerStore.findOneAndUpdate(
      { user: userId },
      data,
      { new: true }
    );
    if (!store) {
      throw new Error('Store not found');
    }
    return store;
  }

  async getSellerDashboard(userId) {
    const productsCount = await Product.countDocuments({ seller: userId, status: 'ACTIVE' });
    
    // Revenue and orders count
    // Note: Order items contain seller id. So we aggregate orders where items match sellerId
    const orderStats = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.seller": userId, orderStatus: { $ne: "CANCELLED" } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          totalOrders: { $addToSet: "$_id" }
        }
      }
    ]);

    const stats = orderStats.length > 0 ? orderStats[0] : { totalRevenue: 0, totalOrders: [] };
    const ordersCount = stats.totalOrders.length;

    // Recent orders
    const recentOrders = await Order.find({ "items.seller": userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    return {
      revenue: stats.totalRevenue,
      ordersCount,
      productsCount,
      recentOrders
    };
  }

  async getSellerProducts(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments({ seller: userId, status: { $ne: 'DELETED' } });
    const products = await Product.find({ seller: userId, status: { $ne: 'DELETED' } })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getSellerOrders(userId, page = 1, limit = 10, status) {
    const query = { "items.seller": userId };
    if (status) query.orderStatus = status;

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone');

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateOrderStatus(sellerId, orderId, status) {
    const order = await Order.findOne({ _id: orderId, "items.seller": sellerId });
    if (!order) {
      throw new Error('Order not found or not yours');
    }

    order.orderStatus = status;
    order.timeline.push({ status, comment: `Updated by seller to ${status}` });
    await order.save();
    return order;
  }

  async subscribePlan(userId, planId, planName) {
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Set endDate to 30 days from now for a monthly subscription
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    user.subscription = {
      planId,
      planName,
      startDate: new Date(),
      endDate,
      status: 'ACTIVE'
    };

    await user.save();
    return user.subscription;
  }
}

module.exports = new SellerService();
