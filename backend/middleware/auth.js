const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Silently continue without auth
    next();
  }
};

// Middleware to check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.isPhoneVerified) {
    return res.status(403).json({
      success: false,
      message: 'Phone verification required.'
    });
  }
  next();
};

// Middleware to check if user has identity verification
const requireIdentityVerification = (req, res, next) => {
  if (!req.user.isIdentityVerified) {
    return res.status(403).json({
      success: false,
      message: 'Identity verification required to perform this action.'
    });
  }
  next();
};

// Middleware to check if user is professional
const requireProfessional = (req, res, next) => {
  if (!req.user.isProfessional) {
    return res.status(403).json({
      success: false,
      message: 'Professional account required.'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  requireVerification,
  requireIdentityVerification,
  requireProfessional
};
