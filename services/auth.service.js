const User = require('../models/User');
const tokenHelper = require('../helpers/token.helper');
const otpHelper = require('../helpers/otp.helper');
const emailHelper = require('../helpers/email.helper');
const crypto = require('crypto');

const generateReferralCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
};

class AuthService {
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 400;
      throw error;
    }

    const referralCode = generateReferralCode();
    const user = new User({ ...userData, referralCode });
    await user.save();

    // Generate tokens (synchronous - no await needed)
    const accessToken = tokenHelper.generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = tokenHelper.generateRefreshToken({ id: user._id, role: user.role });

    user.refreshTokens.push(refreshToken);
    await user.save();


    // Send welcome & OTP emails — non-blocking, won't crash registration if email fails
    try {
      const otp = otpHelper.generateOTP();
      otpHelper.storeOTP(user.email, otp);
      await emailHelper.sendWelcomeEmail(user.email, user.name);
      await emailHelper.sendOTPEmail(user.email, otp);
    } catch (emailError) {
      // Log email failure but don't fail the registration
      require('../utils/logger').warn(`Email sending failed for ${user.email}: ${emailError.message}`);
    }

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;

    return { user: userObj, accessToken, refreshToken };
  }

  async login(email, password, ip, device) {
    // select('+password') is required because password has select:false in schema
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (user.accountStatus === 'BLOCKED') {
      const error = new Error('Your account is blocked. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    // Check lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const error = new Error('Account temporarily locked due to multiple failed login attempts. Try again in 15 minutes.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // lock for 15 minutes
      }
      await user.save();
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();

    // Update login history to keep only the latest login
    user.loginHistory = { ip, device, timestamp: new Date() };

    const accessToken = tokenHelper.generateAccessToken({ id: user._id, role: user.role, name : user.name, email: user.email, subscription : user.subscription, permissions : [ user.role ] });
    const refreshToken = tokenHelper.generateRefreshToken({ id: user._id, role: user.role,  name : user.name, email: user.email, subscription : user.subscription, permissions : [ user.role ] });

    user.refreshTokens.push(refreshToken);
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;

    return { user: userObj, accessToken, refreshToken };
  }

  async logout(userId, refreshToken) {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken }
    });
    return true;
  }

  async refreshToken(token) {
    const decoded = await tokenHelper.verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(token)) {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    const newAccessToken = await tokenHelper.generateAccessToken({ id: user._id, role: user.role, name : user.name, email: user.email });
    return { accessToken: newAccessToken };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await emailHelper.sendPasswordResetEmail(user.email, resetToken);
    return true;
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      const error = new Error('Invalid or expired reset token');
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return true;
  }

  async verifyEmail(email, otp) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isValid = await otpHelper.verifyOTP(email, otp);
    if (!isValid) {
      const error = new Error('Invalid or expired OTP');
      error.statusCode = 400;
      throw error;
    }

    user.isEmailVerified = true;
    await user.save();

    return true;
  }

  async resendVerificationOTP(email) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.isEmailVerified) {
      const error = new Error('Email is already verified');
      error.statusCode = 400;
      throw error;
    }

    const otp = await otpHelper.generateOTP();
    await otpHelper.storeOTP(user.email, otp);
    await emailHelper.sendOTPEmail(user.email, otp);

    return true;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      const error = new Error('Incorrect old password');
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;
    await user.save();

    return true;
  }

  async getProfile(userId) {
    const user = await User.findById(userId).select('-password -refreshTokens');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = new AuthService();
