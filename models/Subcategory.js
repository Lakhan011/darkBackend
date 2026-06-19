const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  // slug: { type: String, unique: true, required: true },
  // image: String,
  description: String,
  // seoTitle: String,
  // seoDescription: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  // sortOrder: { type: Number, default: 0 }
}, {
  timestamps: true
});

subcategorySchema.index({ categoryId: 1 });

module.exports = mongoose.model('Subcategory', subcategorySchema);
