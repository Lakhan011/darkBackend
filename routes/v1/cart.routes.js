const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cart.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate); // all routes require authenticate

router.get('/', cartController.getCart);
router.get('/summary', cartController.getCartSummary);
router.post('/add', cartController.addToCart);
router.put('/item/:itemId', cartController.updateCartItem);
router.delete('/item/:itemId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);
router.post('/apply-coupon', cartController.applyCoupon);
router.delete('/remove-coupon', cartController.removeCoupon);

module.exports = router;
