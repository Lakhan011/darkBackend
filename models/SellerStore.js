const mongoose = require('mongoose');

const sellerStoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  storeName: { type: String, required: true },
  storeSlug: { type: String, unique: true, required: true },
  storeLogo: String,
  storeBanner: String,
  businessEmail: String,
  businessPhone: String,
  gstNumber: String,
  panNumber: String,
  businessAddress: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  },
  storeDescription: String,
  approvalStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
    default: 'PENDING'
  },
  approvalNote: String,
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 10 },
  isActive: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('SellerStore', sellerStoreSchema);
