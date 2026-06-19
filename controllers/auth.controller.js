const authService = require('../services/auth.service');
const responseHelper = require('../helpers/response.helper');
const logger = require('../utils/logger');

class AuthController {
  async register(req, res) {
    try {
      const data = await authService.register(req.body);
      return responseHelper.successResponse(res, 'User registered successfully. Please verify your email.', data, 201);
    } catch (error) {
      logger.error(`Register Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const ip = req.ip;
      const device = req.headers['user-agent'];
      const data = await authService.login(email, password, ip, device);
      return responseHelper.successResponse(res, 'Logged in successfully', data);
    } catch (error) {
      logger.error(`Login Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return responseHelper.errorResponse(res, 'Refresh token is required', 400);
      }
      await authService.logout(req.user.id, refreshToken);
      return responseHelper.successResponse(res, 'Logged out successfully');
    } catch (error) {
      logger.error(`Logout Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async refreshToken(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return responseHelper.errorResponse(res, 'Refresh token is required', 400);
      }
      const data = await authService.refreshToken(token);
      return responseHelper.successResponse(res, 'Token refreshed successfully', data);
    } catch (error) {
      logger.error(`Refresh Token Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      return responseHelper.successResponse(res, 'Password reset instructions sent to your email');
    } catch (error) {
      logger.error(`Forgot Password Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      await authService.resetPassword(token, password);
      return responseHelper.successResponse(res, 'Password reset successfully');
    } catch (error) {
      logger.error(`Reset Password Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async verifyEmail(req, res) {
    try {
      const { email, otp } = req.body;
      await authService.verifyEmail(email, otp);
      return responseHelper.successResponse(res, 'Email verified successfully');
    } catch (error) {
      logger.error(`Verify Email Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async resendVerificationOTP(req, res) {
    try {
      const { email } = req.body;
      await authService.resendVerificationOTP(email);
      return responseHelper.successResponse(res, 'OTP resent successfully');
    } catch (error) {
      logger.error(`Resend OTP Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, oldPassword, newPassword);
      return responseHelper.successResponse(res, 'Password changed successfully');
    } catch (error) {
      logger.error(`Change Password Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async getProfile(req, res) {
    try {
      const data = await authService.getProfile(req.user.id);
      return responseHelper.successResponse(res, 'Profile fetched successfully', data);
    } catch (error) {
      logger.error(`Get Profile Error: ${error.message}`);
      return responseHelper.errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new AuthController();
