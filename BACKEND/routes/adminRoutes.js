// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const File = require('../models/File');
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const sanitize = require('mongo-sanitize');

// Apply authentication and admin middleware to all routes
router.use(verifyToken, isAdmin);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Admin
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(sanitize(req.params.id)).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Admin
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role } = sanitize(req.body);
    
    // Find user
    let user = await User.findById(sanitize(req.params.id));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user
    user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Admin
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(sanitize(req.params.id));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Don't allow deleting your own account
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    // Delete user's projects and files
    const projects = await Project.find({ owner: user._id });
    
    for (const project of projects) {
      // Delete files associated with the project
      await File.deleteMany({ project: project._id });
      
      // Delete the project
      await Project.findByIdAndDelete(project._id);
    }
    
    // Delete the user
    await User.findByIdAndDelete(user._id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Create a new user
 * @access  Admin
 */
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = sanitize(req.body);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user' // Default to 'user' if role is not provided
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics
 * @access  Admin
 */
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    const totalProjects = await Project.countDocuments();
    const totalFiles = await File.countDocuments();
    
    // Get recent users
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get recent projects
    const recentProjects = await Project.find()
      .select('name owner createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('owner', 'name email');
    
    res.status(200).json({
      success: true,
      data: {
        userStats: {
          total: totalUsers,
          admin: adminUsers,
          regular: regularUsers
        },
        projectStats: {
          total: totalProjects
        },
        fileStats: {
          total: totalFiles
        },
        recentUsers,
        recentProjects
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
