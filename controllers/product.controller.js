const productService = require('../services/product.service');
const responseHelper = require('../helpers/response.helper');
const logger = require('../utils/logger');

class ProductController {
  async getProducts(req, res) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const data = await productService.getProducts(filters, parseInt(page), parseInt(limit));
      return responseHelper.paginatedResponse(res, 'Products fetched successfully', data.products, data.total, data.page, data.totalPages);
    } catch (error) {
      logger.error(`Get Products Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getFeaturedProducts(req, res) {
    try {
      const data = await productService.getFeaturedProducts();
      return responseHelper.successResponse(res, 'Featured products fetched', data);
    } catch (error) {
      logger.error(`Get Featured Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getTrendingProducts(req, res) {
    try {
      const data = await productService.getTrendingProducts();
      return responseHelper.successResponse(res, 'Trending products fetched', data);
    } catch (error) {
      logger.error(`Get Trending Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async searchProducts(req, res) {
    try {
      const { q, page = 1, limit = 10, ...filters } = req.query;
      const data = await productService.searchProducts(q, filters, parseInt(page), parseInt(limit));
      return responseHelper.paginatedResponse(res, 'Search results', data.products, data.total, data.page, data.totalPages);
    } catch (error) {
      logger.error(`Search Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getProductsByCategory(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await productService.getProductsByCategory(req.params.categoryId, parseInt(page), parseInt(limit));
      return responseHelper.paginatedResponse(res, 'Products fetched', data.products, data.total, data.page, data.totalPages);
    } catch (error) {
      logger.error(`Get by Category Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getProductsBySubcategory(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await productService.getProductsBySubcategory(req.params.subcategoryId, parseInt(page), parseInt(limit));
      return responseHelper.paginatedResponse(res, 'Products fetched', data.products, data.total, data.page, data.totalPages);
    } catch (error) {
      logger.error(`Get by Subcategory Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getProductBySlug(req, res) {
    try {
      const data = await productService.getProductBySlug(req.params.slug);
      const related = await productService.getRelatedProducts(data._id);
      return responseHelper.successResponse(res, 'Product fetched', { product: data, related });
    } catch (error) {
      logger.error(`Get Product By Slug Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async createProduct(req, res) {
    try {
      const data = await productService.createProduct(req.body, req.files);
      return responseHelper.successResponse(res, 'Product created successfully', data, 201);
    } catch (error) {
      logger.error(`Create Product Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async updateProduct(req, res) {
    try {
      const data = await productService.updateProduct(req.params.id, req.body, req.files);
      return responseHelper.successResponse(res, 'Product updated successfully', data);
    } catch (error) {
      logger.error(`Update Product Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      return responseHelper.successResponse(res, 'Product deleted successfully');
    } catch (error) {
      logger.error(`Delete Product Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new ProductController();
