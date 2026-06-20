const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

class CartService {
  async getCart(userId) {
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    return cart;
  }

  async addToCart(userId, productId, quantity, variantOption) {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const requestedQuantity = Number(quantity);

    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && item.variantOption === variantOption
    );

    let newTotalQuantity = requestedQuantity;
    if (existingItemIndex > -1) {
      newTotalQuantity += cart.items[existingItemIndex].quantity;
    }

    if (newTotalQuantity > product.stockQuantity) {
      const error = new Error(`Cannot add to cart. Only ${product.stockQuantity} items available in stock.`);
      error.statusCode = 400;
      throw error;
    }

    const sellingPrice = product.discountPrice || product.price;

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = newTotalQuantity;
      // Update snapshot data in case it changed
      cart.items[existingItemIndex].price = sellingPrice;
      cart.items[existingItemIndex].productName = product.productName;
      cart.items[existingItemIndex].thumbnail = product.thumbnail || (product.images?.length ? product.images[0] : '');
    } else {
      cart.items.push({
        productId: productId,
        quantity: requestedQuantity,
        variantOption,
        price: sellingPrice,
        productName: product.productName,
        thumbnail: product.thumbnail || (product.images?.length ? product.images[0] : '')
      });
    }

    await cart.save();
    return this.getCartSummary(userId);
  }

  async updateCartItem(userId, itemId, quantity) {
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) throw new Error('Cart not found');

    const item = cart.items.id(itemId);
    if (!item) throw new Error('Item not found in cart');

    const requestedQuantity = Number(quantity);
    
    // Check stock if productId is populated
    if (item.productId && item.productId.stockQuantity !== undefined) {
      if (requestedQuantity > item.productId.stockQuantity) {
        const error = new Error(`Only ${item.productId.stockQuantity} items available in stock.`);
        error.statusCode = 400;
        throw error;
      }
    }

    item.quantity = requestedQuantity;
    await cart.save();
    return this.getCartSummary(userId);
  }

  async removeFromCart(userId, itemId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error('Cart not found');

    cart.items.pull(itemId);
    await cart.save();
    return this.getCartSummary(userId);
  }

  async clearCart(userId) {
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      cart.couponCode = undefined;
      cart.couponDiscount = 0;
      await cart.save();
    }
    return this.getCartSummary(userId);
  }

  async applyCoupon(userId, couponCode) {
    const cart = await this.getCart(userId); // ensure cart exists
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

    cart.couponCode = coupon.code;
    cart.couponDiscount = discount;
    await cart.save();

    return this.getCartSummary(userId);
  }

  async removeCoupon(userId) {
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.couponCode = undefined;
      cart.couponDiscount = 0;
      await cart.save();
    }
    return this.getCartSummary(userId);
  }

  async getCartSummary(userId) {
    const cart = await this.getCart(userId);
    
    let subtotal = 0;
    for (const item of cart.items) {
      // Use the snapshotted price inside the cart item for the subtotal to avoid breaking if product is deleted
      const price = item.price || 0; 
      subtotal += price * item.quantity;
    }

    const discount = cart.couponDiscount || 0;
    const tax = 0; // Removing tax for simplicity unless requested
    const shipping = (subtotal > 0 && subtotal < 500) ? 40 : 0; // Flat 40rs shipping if < 500
    const total = subtotal - discount + tax + shipping;

    return {
      subtotal,
      discount,
      tax,
      shipping,
      total,
      items: cart.items,
      couponApplied: !!cart.couponCode,
      couponCode: cart.couponCode
    };
  }
}

module.exports = new CartService();
