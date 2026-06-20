const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../helpers/response.helper');

exports.generalLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50000, // Limit each IP
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    return errorResponse(res, 'Too many requests, please try again later', 429);
  }
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 5 auth requests per window
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many login attempts, please try again after 15 minutes', 429);
  }
});

exports.otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30000, // Limit each IP to 3 OTP requests per hour
  message: 'Too many OTP requests from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many OTP requests, please try again after an hour', 429);
  }
});
