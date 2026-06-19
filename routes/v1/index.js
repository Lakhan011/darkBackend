const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const wishlistRoutes = require('./wishlist.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const sellerRoutes = require('./seller.routes');
const adminRoutes = require('./admin.routes');
const reviewRoutes = require('./review.routes');
const notificationRoutes = require('./notification.routes');

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/seller', sellerRoutes);
router.use('/admin', adminRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
