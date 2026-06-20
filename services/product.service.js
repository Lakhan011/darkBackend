const Product = require('../models/Product');
const slugify = require('../utils/slugify');

class ProductService {
  async getProducts(filters = {}, page = 1, limit = 10) {
    const query = {};
    
    if (filters.status && filters.status !== 'ALL') {
      query.status = filters.status;
    } else if (filters.status !== 'ALL') {
      query.status = { $ne: 'DELETED' };
    }

    if (filters.productName) query.productName = { $regex: new RegExp(filters.productName, 'i') };
    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.subcategoryId) query.subcategoryId = filters.subcategoryId;
    if (filters.brand) query.brand = { $regex: new RegExp(filters.brand, 'i') };
    if (filters.sellerId) query.sellerId = filters.sellerId;
    if (filters.recommended !== undefined && filters.recommended !== '') {
      query.recommended = filters.recommended === 'true' || filters.recommended === true;
    }
    
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
    }
    
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    if (filters.rating) query['ratings.average'] = { $gte: Number(filters.rating) };
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    let sortQuery = { createdAt: -1 };
    if (filters.sortBy) {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      sortQuery = { [filters.sortBy]: order };
    } else if (filters.search) {
      sortQuery = { score: { $meta: "textScore" } };
    }

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .populate('sellerId', 'name storeName')
      .skip(skip)
      .limit(limit)
      .sort(sortQuery);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getProductBySlug(slug) {
    const product = await Product.findOneAndUpdate(
      { slug, status: { $ne: 'DELETED' } },
      { $inc: { views: 1 } },
      { new: true }
    )
    .populate('categoryId', 'name slug')
    .populate('subcategoryId', 'name slug')
    .populate('sellerId', 'name email');

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async getProductById(id) {
    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
    .populate('categoryId', 'name slug')
    .populate('subcategoryId', 'name slug')
    .populate('sellerId', 'name email storeName');

    if (!product || product.status === 'DELETED') {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async getProductsByCategory(categoryId, page = 1, limit = 10) {
    return this.getProducts({ categoryId }, page, limit);
  }

  async getProductsBySubcategory(subcategoryId, page = 1, limit = 10) {
    return this.getProducts({ subcategoryId }, page, limit);
  }

  async searchProducts(query, filters = {}, page = 1, limit = 10) {
    filters.search = query;
    return this.getProducts(filters, page, limit);
  }

  async getFeaturedProducts() {
    return Product.find({ featured: true, status: 'ACTIVE' })
      .limit(10)
      .populate('categoryId', 'name');
  }

  async getTrendingProducts() {
    return Product.find({ status: 'ACTIVE' })
      .sort({ totalSales: -1 })
      .limit(10)
      .populate('categoryId', 'name');
  }

  async getRelatedProducts(productId) {
    const product = await Product.findById(productId);
    if (!product) return [];
    
    return Product.find({
      categoryId: product.categoryId,
      _id: { $ne: product._id },
      status: 'ACTIVE'
    })
    .limit(5)
    .populate('categoryId', 'name');
  }

  async createProduct(data, files) {
    if (data.productName) {
      data.slug = slugify(data.productName + '-' + Date.now().toString().slice(-4));
    }
    
    if (files && files.length > 0) {
      data.images = files.map(file => `/uploads/${file.filename}`);
      data.thumbnail = data.images[0];
    } else {
      data.images = [];
    }

    const product = new Product(data);
    await product.save();
    return product;
  }

  async updateProduct(id, data, files) {
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.productName && data.productName !== product.productName) {
      data.slug = slugify(data.productName + '-' + Date.now().toString().slice(-4));
    }

    let updatedImages = [];
    if (data.existingImages) {
      updatedImages = Array.isArray(data.existingImages) ? data.existingImages : [data.existingImages];
    } else if (data.existingImages === undefined) {
      // If client didn't send existingImages field at all, retain old images.
      updatedImages = product.images || [];
    }
    
    if (files && files.length > 0) {
      const newImages = files.map(file => `/uploads/${file.filename}`);
      updatedImages = [...updatedImages, ...newImages];
    }

    data.images = updatedImages;
    if (updatedImages.length > 0) {
      data.thumbnail = updatedImages[0];
    } else {
      data.thumbnail = null;
    }

    Object.assign(product, data);
    await product.save();
    return product;
  }

  async deleteProduct(id) {
    const product = await Product.findByIdAndUpdate(
      id,
      { status: 'DELETED' },
      { new: true }
    );
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return true;
  }

  async updateProductStatus(id, status) {
    const product = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }
}

module.exports = new ProductService();
