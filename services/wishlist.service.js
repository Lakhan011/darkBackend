const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

class WishlistService {
  async getWishlist(userId) {
    let wishlist = await Wishlist.findOne({ user: userId }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }
    return wishlist;
  }

  async addToWishlist(userId, productId) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    return this.getWishlist(userId);
  }

  async removeFromWishlist(userId, productId) {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (wishlist) {
      wishlist.products.pull(productId);
      await wishlist.save();
    }
    return this.getWishlist(userId);
  }

  async checkInWishlist(userId, productId) {
    const wishlist = await Wishlist.findOne({ user: userId, products: productId });
    return !!wishlist;
  }

  async clearWishlist(userId) {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (wishlist) {
      wishlist.products = [];
      await wishlist.save();
    }
    return true;
  }
}

module.exports = new WishlistService();
