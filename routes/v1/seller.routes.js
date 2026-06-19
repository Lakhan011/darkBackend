const express = require('express');
const router = express.Router();
const sellerController = require('../../controllers/seller.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

router.use(authenticate, authorize('SELLER', 'ADMIN'));

router.get('/dashboard', sellerController.getDashboard);
router.get('/store', sellerController.getMyStore);
router.post('/store', sellerController.registerStore);
router.put('/store', sellerController.updateStore);
router.get('/products', sellerController.getProducts);
router.get('/orders', sellerController.getOrders);
router.put('/orders/:orderId/status', sellerController.updateOrderStatus);
router.post('/subscribe', sellerController.subscribePlan);

module.exports = router;
