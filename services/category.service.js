const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const slugify = require('../utils/slugify');

class CategoryService {
  async getAllCategories() {
    // Return active categories with subcategory count
    const categories = await Category.aggregate([
      { $match: { status: 'ACTIVE' } },
      {
        $lookup: {
          from: 'subcategories',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'subcategories'
        }
      },
      {
        $addFields: {
          subcategoryCount: { $size: { $filter: { input: '$subcategories', as: 'sub', cond: { $eq: ['$$sub.status', 'ACTIVE'] } } } }
        }
      },
      {
        $project: { subcategories: 0 }
      }
    ]);
    return categories;
  }

  async getCategoryWithSubcategories() {
    const catsWithSub = await Category.aggregate([
      { $match: { status: 'ACTIVE' } },
      {
        $lookup: {
          from: 'subcategories',
          localField: '_id',
          foreignField: 'categoryId',
          pipeline: [{ $match: { status: 'ACTIVE' } }],
          as: 'subcategories'
        }
      }
    ]);
    
    return catsWithSub;
  }

  async getCategoryBySlug(slug) {
    const category = await Category.findOne({ slug, status: 'ACTIVE' }).lean();
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    const subcategories = await Subcategory.find({ categoryId: category._id, status: 'ACTIVE' }).lean();
    return { ...category, subcategories };
  }

  async createCategory(data) {
    const slug = slugify(data.name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      const error = new Error('Category already exists');
      error.statusCode = 400;
      throw error;
    }
    const category = new Category({ ...data, slug });
    await category.save();
    return category;
  }

  async updateCategory(id, data) {
    if (data.name) {
      data.slug = slugify(data.name);
    }
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return category;
  }

  async deleteCategory(id) {
    const category = await Category.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    // Also deactivate subcategories
    await Subcategory.updateMany({ categoryId: id }, { status: 'INACTIVE' });
    return true;
  }

  async createSubcategory(data) {
    const slug = slugify(data.name);
    const subcategory = new Subcategory({ ...data, slug });
    await subcategory.save();
    return subcategory;
  }

  async updateSubcategory(id, data) {
    if (data.name) {
      data.slug = slugify(data.name);
    }
    const subcategory = await Subcategory.findByIdAndUpdate(id, data, { new: true });
    if (!subcategory) {
      const error = new Error('Subcategory not found');
      error.statusCode = 404;
      throw error;
    }
    return subcategory;
  }

  async deleteSubcategory(id) {
    const subcategory = await Subcategory.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
    if (!subcategory) {
      const error = new Error('Subcategory not found');
      error.statusCode = 404;
      throw error;
    }
    return true;
  }

  async getAllSubcategories() {
    return await Subcategory.find({ status: 'ACTIVE' }).populate('categoryId').lean();
  }
}

module.exports = new CategoryService();
