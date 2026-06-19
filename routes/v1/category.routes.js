const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/category.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

router.get('/', categoryController.getAllCategories);
router.get('/with-subcategories', categoryController.getCategoryWithSubcategories);
router.get('/:slug', categoryController.getCategoryBySlug);

router.post('/', authenticate, authorize('ADMIN'), categoryController.createCategory);
router.put('/:id', authenticate, authorize('ADMIN'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), categoryController.deleteCategory);

router.post('/subcategory', authenticate, authorize('ADMIN'), categoryController.createSubcategory);
router.get('/subcategory', categoryController.getAllSubcategories);
router.get('/subcategory/:categoryId', categoryController.getSubcategoriesByCategory);
router.put('/subcategory/:id', authenticate, authorize('ADMIN'), categoryController.updateSubcategory);
router.delete('/subcategory/:id', authenticate, authorize('ADMIN'), categoryController.deleteSubcategory);

module.exports = router;
