const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

class CartService {
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
  }

  async addToCart(userId, productId, quantity, variantOption) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId && item.variantOption === variantOption
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        variantOption,
        price: product.price
      });
    }

    await cart.save();
    return this.getCart(userId);
  }

  async updateCartItem(userId, itemId, quantity) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error('Cart not found');

    const item = cart.items.id(itemId);
    if (!item) throw new Error('Item not found in cart');

    item.quantity = quantity;
    await cart.save();
    return this.getCart(userId);
  }

  async removeFromCart(userId, itemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error('Cart not found');

    cart.items.pull(itemId);
    await cart.save();
    return this.getCart(userId);
  }

  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      cart.coupon = undefined;
      cart.discount = 0;
      await cart.save();
    }
    return cart;
  }

  async applyCoupon(userId, couponCode) {
    const cart = await this.getCart(userId);
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      status: 'ACTIVE',
      expiryDate: { $gt: Date.now() }
    });

    if (!coupon) {
      throw new Error('Invalid or expired coupon');
    }

    let subtotal = 0;
    for (const item of cart.items) {
      subtotal += item.price * item.quantity;
    }

    if (subtotal < coupon.minPurchaseAmount) {
      throw new Error(`Minimum purchase of ${coupon.minPurchaseAmount} required`);
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    cart.coupon = coupon._id;
    cart.discount = discount;
    await cart.save();

    return this.getCartSummary(userId);
  }

  async removeCoupon(userId) {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.coupon = undefined;
      cart.discount = 0;
      await cart.save();
    }
    return this.getCartSummary(userId);
  }

  async getCartSummary(userId) {
    const cart = await this.getCart(userId);
    
    let subtotal = 0;
    for (const item of cart.items) {
      const price = item.product.price || item.price; // fallback if product is unpopulated
      subtotal += price * item.quantity;
    }

    const discount = cart.discount || 0;
    const tax = (subtotal - discount) * 0.18; // Assume 18% tax
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over 500
    const total = subtotal - discount + tax + shipping;

    return {
      subtotal,
      discount,
      tax,
      shipping,
      total,
      items: cart.items,
      couponApplied: !!cart.coupon
    };
  }
}

module.exports = new CartService();
