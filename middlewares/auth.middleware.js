const { verifyAccessToken } = require('../helpers/token.helper');
const { errorResponse } = require('../helpers/response.helper');
const User = require('../models/User'); // Will be created later

exports.authenticate = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return errorResponse(res, 'Not authorized to access this route', 401);
    }

    const decoded = verifyAccessToken(token);
    
    // In a real app, you might want to fetch the user from DB to ensure they still exist
    // req.user = await User.findById(decoded.id).select('-password');
    // If we just rely on token payload:
    req.user = decoded;
    
    next();
  } catch (error) {
    return errorResponse(res, 'Token is invalid or expired', 401);
  }
};

exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    next(); // Ignore errors for optional auth
  }
};
