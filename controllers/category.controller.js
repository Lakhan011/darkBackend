const categoryService = require('../services/category.service');
const responseHelper = require('../helpers/response.helper');
const logger = require('../utils/logger');
const cache = require('../config/cache'); // cache.set, cache.get

class CategoryController {
  async getAllCategories(req, res) {
    try {
      const cached = await cache.get('categories_all');
      if (cached) return responseHelper.successResponse(res, 'Categories fetched (cached)', cached);

      const data = await categoryService.getAllCategories();
      await cache.set('categories_all', data, 3600); // 1 hour
      return responseHelper.successResponse(res, 'Categories fetched successfully', data);
    } catch (error) {
      logger.error(`Get All Categories Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getCategoryWithSubcategories(req, res) {
    try {
      const cached = await cache.get('categories_with_subs');
      if (cached) return responseHelper.successResponse(res, 'Categories fetched (cached)', cached);

      const data = await categoryService.getCategoryWithSubcategories();
      await cache.set('categories_with_subs', data, 3600);
      return responseHelper.successResponse(res, 'Categories fetched successfully', data);
    } catch (error) {
      logger.error(`Get Categories with Subs Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getCategoryBySlug(req, res) {
    try {
      const data = await categoryService.getCategoryBySlug(req.params.slug);
      return responseHelper.successResponse(res, 'Category fetched successfully', data);
    } catch (error) {
      logger.error(`Get Category By Slug Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async createCategory(req, res) {
    try {
      const data = await categoryService.createCategory(req.body);
      await cache.del('categories_all');
      await cache.del('categories_with_subs');
      return responseHelper.successResponse(res, 'Category created successfully', data, 201);
    } catch (error) {
      logger.error(`Create Category Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async updateCategory(req, res) {
    try {
      const data = await categoryService.updateCategory(req.params.id, req.body);
      await cache.del('categories_all');
      await cache.del('categories_with_subs');
      return responseHelper.successResponse(res, 'Category updated successfully', data);
    } catch (error) {
      logger.error(`Update Category Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async deleteCategory(req, res) {
    try {
      await categoryService.deleteCategory(req.params.id);
      await cache.del('categories_all');
      await cache.del('categories_with_subs');
      return responseHelper.successResponse(res, 'Category deleted successfully');
    } catch (error) {
      logger.error(`Delete Category Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async createSubcategory(req, res) {
    try {
      const data = await categoryService.createSubcategory(req.body);
      await cache.del('categories_with_subs');
      return responseHelper.successResponse(res, 'Subcategory created successfully', data, 201);
    } catch (error) {
      logger.error(`Create Subcategory Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getSubcategoriesByCategory(req, res) {
    try {
      const Subcategory = require('../models/Subcategory');
      const data = await Subcategory.find({ categoryId: req.params.categoryId, status: 'ACTIVE' });
      return responseHelper.successResponse(res, 'Subcategories fetched successfully', data);
    } catch (error) {
      logger.error(`Get Subcategories Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async updateSubcategory(req, res) {
    try {
      const data = await categoryService.updateSubcategory(req.params.id, req.body);
      await cache.del('categories_with_subs');
      return responseHelper.successResponse(res, 'Subcategory updated successfully', data);
    } catch (error) {
      logger.error(`Update Subcategory Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async deleteSubcategory(req, res) {
    try {
      await categoryService.deleteSubcategory(req.params.id);
      await cache.del('categories_with_subs');
      return responseHelper.successResponse(res, 'Subcategory deleted successfully');
    } catch (error) {
      logger.error(`Delete Subcategory Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getAllSubcategories(req, res) {
    try {
      const data = await categoryService.getAllSubcategories();
      return responseHelper.successResponse(res, 'All subcategories fetched successfully', data);
    } catch (error) {
      logger.error(`Get All Subcategories Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new CategoryController();
