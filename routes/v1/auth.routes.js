const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authLimiter } = require('../../middlewares/rateLimiter.middleware');
const authValidator = require('../../validators/auth.validator');

router.post('/register', authLimiter, validate(authValidator.registerSchema), authController.register);
router.post('/login', authLimiter, validate(authValidator.loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', validate(authValidator.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', validate(authValidator.resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', validate(authValidator.verifyOTPSchema), authController.verifyEmail);
router.post('/resend-otp', authController.resendVerificationOTP);
router.put('/change-password', authenticate, validate(authValidator.changePasswordSchema), authController.changePassword);
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
