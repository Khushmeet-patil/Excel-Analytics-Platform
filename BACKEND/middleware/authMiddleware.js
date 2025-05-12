// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyToken = async (req, res, next) => {
  try {
    let token;

    // Check cookies or Authorization header
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization) {
      // Handle both "Bearer token" and just "token" formats
      const authHeader = req.headers.authorization;
      token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: No token provided'
      });
    }

    // Validate token format
    if (typeof token !== 'string' || token.trim() === '') {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid token format'
      });
    }

    // Verify token
    let decoded;
    try {
      // Make sure we have a JWT_SECRET
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error'
        });
      }

      decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Validate decoded token has required fields
      if (!decoded || !decoded.id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed: Invalid token payload'
        });
      }
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message);
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed: Invalid token'
        });
      } else if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed: Token expired'
        });
      }
      throw jwtError;
    }

    // Find user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Authentication failed: User not found'
      });
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message
    });
  }
};

