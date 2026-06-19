const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/order.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', orderController.getMyOrders);
router.get('/:orderId', orderController.getOrderById);
router.post('/place', orderController.placeOrder);
router.put('/:orderId/cancel', orderController.cancelOrder);
router.post('/:orderId/return', orderController.requestReturn);

module.exports = router;
