const Joi = require('joi');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/;

const authValidator = {
  registerSchema: Joi.object({
    name: Joi.string().required().trim(),
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().pattern(passwordPattern).required()
      .messages({ 'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter and one number.' }),
    phone: Joi.string().pattern(/^\d{10}$/).optional()
      .messages({ 'string.pattern.base': 'Phone number must be exactly 10 digits.' }),
    role: Joi.string().valid('CUSTOMER', 'SELLER').optional()
  }),

  loginSchema: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required()
  }),

  forgotPasswordSchema: Joi.object({
    email: Joi.string().email().required().trim().lowercase()
  }),

  resetPasswordSchema: Joi.object({
    password: Joi.string().pattern(passwordPattern).required()
      .messages({ 'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter and one number.' }),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required()
      .messages({ 'any.only': 'Passwords do not match.' })
  }),

  verifyOTPSchema: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    otp: Joi.string().length(6).required()
  }),

  changePasswordSchema: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().pattern(passwordPattern).required()
      .messages({ 'string.pattern.base': 'New password must be at least 8 characters long and contain at least one uppercase letter and one number.' }),
    confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required()
      .messages({ 'any.only': 'Passwords do not match.' })
  })
};

module.exports = authValidator;
