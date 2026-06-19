const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  // slug: { type: String, unique: true, required: true },
  // image: String,
  // icon: String,
  description: String,
  // seoTitle: String,
  // seoDescription: String,
  // metaKeywords: [String],
  // sortOrder: { type: Number, default: 0 },
  // featured: { type: Boolean, default: false },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, {
  timestamps: true
});

categorySchema.index({ status: 1 });

module.exports = mongoose.model('Category', categorySchema);
