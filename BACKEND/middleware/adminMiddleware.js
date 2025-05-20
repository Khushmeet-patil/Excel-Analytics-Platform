// middleware/adminMiddleware.js
const User = require('../models/User');

/**
 * Middleware to check if the authenticated user has admin privileges
 * This middleware should be used after the verifyToken middleware
 */
exports.isAdmin = async (req, res, next) => {
  try {
    // req.user should be set by the verifyToken middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if the user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // If user is an admin, proceed to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin authorization',
      error: error.message
    });
  }
};
