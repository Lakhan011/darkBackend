const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const addressSchema = new mongoose.Schema({
  label: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  country: String,
  pincode: String,
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  username: { type: String, unique: true, sparse: true, trim: true },
  email: { type: String, unique: true, lowercase: true, required: true, trim: true },
  phone: { type: String, unique: true, sparse: true, trim: true },
  password: { type: String, required: true, select: false },
  profileImage: String,
  gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
  dateOfBirth: Date,
  addresses: [addressSchema],
  role: { type: String, enum: ['ADMIN', 'SELLER', 'DELIVERY_BOY', 'CUSTOMER'], default: 'CUSTOMER' },
  permissions: [String],
  walletBalance: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  accountStatus: { type: String, enum: ['ACTIVE', 'BLOCKED', 'DELETED'], default: 'ACTIVE' },
  verificationStatus: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false }
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  lastLogin: Date,
  loginHistory: {
    ip: String,
    device: String,
    browser: String,
    os: String,
    timestamp: { type: Date, default: Date.now }
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  languagePreference: { type: String, default: 'en' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  refreshTokens: [String],
  isEmailVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  subscription: {
    planId: String,
    planName: String,
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'], default: 'ACTIVE' }
  }
}, {
  timestamps: true
});


userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', userSchema);
