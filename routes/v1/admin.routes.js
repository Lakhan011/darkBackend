const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/analytics/revenue', adminController.getRevenueChart);

router.get('/users', adminController.getAllUsers);
router.put('/users/:id/block', adminController.blockUser);
router.put('/users/:id/unblock', adminController.unblockUser);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/role', adminController.changeUserRole);

router.get('/sellers/pending', adminController.getPendingSellers);
router.put('/sellers/:id/approve', adminController.approveSeller);
router.put('/sellers/:id/reject', adminController.rejectSeller);

router.get('/orders', adminController.getAllOrders);
router.get('/inventory/low-stock', adminController.getLowStockProducts);

module.exports = router;
