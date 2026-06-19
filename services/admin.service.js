const User = require('../models/User');
const SellerStore = require('../models/SellerStore');
const Product = require('../models/Product');
const Order = require('../models/Order');

class AdminService {
  async getDashboardStats() {
    const usersCount = await User.countDocuments({ role: 'CUSTOMER' });
    const sellersCount = await User.countDocuments({ role: 'SELLER' });
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();
    
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    return {
      users: usersCount,
      sellers: sellersCount,
      products: productsCount,
      orders: ordersCount,
      revenue: totalRevenue
    };
  }

  async getRevenueChart(period = 'month') {
    // Basic implementation for daily revenue in current month
    const match = { orderStatus: { $ne: 'CANCELLED' } };
    
    const chart = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    return chart;
  }

  async getAllUsers(page = 1, limit = 10, filters = {}) {
    const query = {};
    if (filters.search) {
      query.$or = [
        { name: new RegExp(filters.search, 'i') },
        { email: new RegExp(filters.search, 'i') }
      ];
    }
    if (filters.role) query.role = filters.role;

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 });

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async blockUser(userId) {
    const user = await User.findByIdAndUpdate(userId, { status: 'BLOCKED' }, { new: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  async unblockUser(userId) {
    const user = await User.findByIdAndUpdate(userId, { status: 'ACTIVE' }, { new: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  async deleteUser(userId) {
    const user = await User.findByIdAndUpdate(userId, { status: 'DELETED' }, { new: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  async changeUserRole(userId, role) {
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  async getPendingSellers() {
    return SellerStore.find({ status: 'PENDING' }).populate('user', 'name email');
  }

  async approveSeller(sellerId) {
    const store = await SellerStore.findByIdAndUpdate(sellerId, { status: 'APPROVED' }, { new: true });
    if (!store) throw new Error('Store not found');
    await User.findByIdAndUpdate(store.user, { role: 'SELLER' });
    return store;
  }

  async rejectSeller(sellerId, reason) {
    const store = await SellerStore.findByIdAndUpdate(sellerId, { status: 'REJECTED', rejectReason: reason }, { new: true });
    if (!store) throw new Error('Store not found');
    return store;
  }

  async getAllOrders(page = 1, limit = 10, filters = {}) {
    const query = {};
    if (filters.status) query.orderStatus = filters.status;

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getLowStockProducts() {
    return Product.find({ stock: { $lt: 10 } }).populate('seller', 'name storeName');
  }
}

module.exports = new AdminService();
