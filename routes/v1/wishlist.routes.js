const express = require('express');
const router = express.Router();
const wishlistController = require('../../controllers/wishlist.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/add', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);
router.get('/check/:productId', wishlistController.checkInWishlist);
router.delete('/clear/all', wishlistController.clearWishlist);

module.exports = router;
