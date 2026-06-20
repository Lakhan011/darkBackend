const express = require('express');
const router = express.Router();
const productController = require('../../controllers/product.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { uploadMultiple } = require('../../middlewares/upload.middleware');

router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/trending', productController.getTrendingProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/subcategory/:subcategoryId', productController.getProductsBySubcategory);
router.get('/id/:id', productController.getProductById);
router.get('/:slug', productController.getProductBySlug);

router.post('/', authenticate, authorize('ADMIN'), uploadMultiple('images'), productController.createProduct);
router.put('/:id', authenticate, authorize('ADMIN'), uploadMultiple('images'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), productController.deleteProduct);

module.exports = router;
