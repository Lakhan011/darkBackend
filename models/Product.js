const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerStore' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  productName: { type: String, required: true },
  // slug: { type: String, unique: true, required: true },
  shortDescription: String,
  longDescription: String,
  // specifications: [{
  //   key: String,
  //   value: String
  // }],
  // highlights: [String],
  // features: [String],
  brand: String,
  // sku: { type: String, unique: true, sparse: true },
  // barcode: String,
  // tags: [String],
  thumbnail: String,
  images: [String],
  // videos: [String],
  price: { type: Number, required: true },
  discountPrice: Number,
  offerPrice: Number,
  taxPercentage: { type: Number, default: 18 },
  stockQuantity: { type: Number, default: 100 },
  // minOrderQty: { type: Number, default: 1 },
  // maxOrderQty: { type: Number, default: 10 },
  // variants: [{
  //   name: String,
  //   options: [{
  //     value: String,
  //     price: Number,
  //     stockQty: Number,
  //     sku: String,
  //     image: String
  //   }]
  // }],
  colors: [{
    name: String,
    hexCode: String
  }],
  sizes: [String],
  // dimensions: {
  //   length: Number,
  //   width: Number,
  //   height: Number,
  //   unit: String
  // },
  // weight: {
  //   value: Number,
  //   unit: String
  // },
  warranty: String, // yes, no
  returnPolicy: String, // yes, no
  shippingInfo: {
    isFreeShipping: { type: Boolean, default: false },
    shippingCharge: { type: Number, default: 0 },
    estimatedDays: Number
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  reviewsCount: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  // views: { type: Number, default: 0 },
  // featured: { type: Boolean, default: false },
  // trending: { type: Boolean, default: false },
  recommended: { type: Boolean, default: false },
  // seoTitle: String,
  // seoDescription: String,
  // metaKeywords: [String],
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DELETED'], default: 'DRAFT' },
  publishedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.virtual('discountPercentage').get(function() {
  if (this.price && this.discountPrice && this.price > this.discountPrice) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

productSchema.index({ categoryId: 1 });
productSchema.index({ subcategoryId: 1 });
productSchema.index({ sellerId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ tags: 1 });

productSchema.index({
  productName: 'text',
  brand: 'text',
  shortDescription: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Product', productSchema);
