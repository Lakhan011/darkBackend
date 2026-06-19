const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/review.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

router.get('/product/:productId', reviewController.getProductReviews);
router.post('/product/:productId', authenticate, reviewController.addReview);
router.put('/:reviewId', authenticate, reviewController.updateReview);
router.delete('/:reviewId', authenticate, reviewController.deleteReview);
router.post('/:reviewId/helpful', authenticate, reviewController.voteHelpful);
router.put('/:reviewId/moderate', authenticate, authorize('ADMIN'), reviewController.moderateReview);

module.exports = router;
