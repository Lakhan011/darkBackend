const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

router.post('/initiate', authenticate, paymentController.initiatePayment);
router.post('/verify', authenticate, paymentController.verifyPayment);
router.post('/webhook', paymentController.webhook);
router.post('/refund', authenticate, authorize('ADMIN'), paymentController.refund);

module.exports = router;
