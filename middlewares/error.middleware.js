const { errorResponse } = require('../helpers/response.helper');
const logger = require('../utils/logger');

exports.errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  let message = err.message || 'Internal Server Error';
  let statusCode = err.statusCode || 500;

  // Mongoose bad object ID
  if (err.name === 'CastError') {
    message = `Resource not found with id of ${err.value}`;
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  errorResponse(res, message, statusCode);
};
