const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// Verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated',
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      logger.error(`Token verification failed: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Optional authentication (doesn't require token but attaches user if present)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Silent fail for optional auth
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
};

// Check if user is owner or admin
const authorizeOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Admin can access anything
    if (req.user.role === 'admin') {
      return next();
    }

    try {
      const ownerId = await getResourceOwnerId(req);
      
      if (req.user._id.toString() === ownerId.toString()) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. Not the resource owner',
      });
    } catch (error) {
      logger.error(`Owner authorization error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  };
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  authorizeOwnerOrAdmin,
};
