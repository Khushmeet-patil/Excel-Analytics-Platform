// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const UserConsent = require('../models/UserConsent');
const ChatMessage = require('../models/ChatMessage');
const Project = require('../models/Project');
const File = require('../models/File');
const { generateAIResponse, generateInsightsFromData } = require('../utils/groqApi');
const sanitize = require('mongo-sanitize');

// Apply authentication middleware to all routes
router.use(verifyToken);

/**
 * @route   GET /api/ai/consent
 * @desc    Get user's AI data sharing consent status
 * @access  Private
 */
router.get('/consent', async (req, res) => {
  try {
    let consent = await UserConsent.findOne({ user: req.user.id });
    
    if (!consent) {
      // Create a new consent record if none exists
      consent = await UserConsent.create({
        user: req.user.id,
        aiDataSharing: {
          consented: false,
          timestamp: null
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        consented: consent.aiDataSharing.consented,
        timestamp: consent.aiDataSharing.timestamp
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
 * @route   POST /api/ai/consent
 * @desc    Update user's AI data sharing consent
 * @access  Private
 */
router.post('/consent', async (req, res) => {
  try {
    const { consented } = sanitize(req.body);
    
    if (typeof consented !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Consent status must be a boolean value'
      });
    }
    
    let consent = await UserConsent.findOne({ user: req.user.id });
    
    if (!consent) {
      consent = new UserConsent({
        user: req.user.id
      });
    }
    
    consent.aiDataSharing = {
      consented,
      timestamp: consented ? Date.now() : null
    };
    
    await consent.save();
    
    res.status(200).json({
      success: true,
      data: {
        consented: consent.aiDataSharing.consented,
        timestamp: consent.aiDataSharing.timestamp
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
 * @route   POST /api/ai/chat
 * @desc    Send a message to AI and get a response
 * @access  Private
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, projectId, fileId } = sanitize(req.body);
    
    // Check if user has consented to AI data sharing
    const consent = await UserConsent.findOne({ user: req.user.id });
    
    if (!consent || !consent.aiDataSharing.consented) {
      return res.status(403).json({
        success: false,
        message: 'User has not consented to AI data sharing'
      });
    }
    
    // Get context data if projectId or fileId is provided
    let contextData = {};
    
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      
      if (project.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this project'
        });
      }
      
      contextData.project = project;
    }
    
    if (fileId) {
      const file = await File.findById(fileId);
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      
      if (file.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this file'
        });
      }
      
      contextData.file = file;
      contextData.data = file.processedData || file.originalData;
    }
    
    // Save user message
    const userMessage = await ChatMessage.create({
      user: req.user.id,
      project: projectId || null,
      file: fileId || null,
      role: 'user',
      content: message,
      contextData: Object.keys(contextData).length > 0 ? contextData : null
    });
    
    // Get recent chat history for context
    const chatHistory = await ChatMessage.find({
      user: req.user.id,
      project: projectId || null,
      file: fileId || null
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .sort({ timestamp: 1 });
    
    // Format messages for Groq API
    const messages = chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Generate AI response
    const aiResponse = await generateAIResponse(messages, contextData);
    
    // Save AI response
    const assistantMessage = await ChatMessage.create({
      user: req.user.id,
      project: projectId || null,
      file: fileId || null,
      role: 'assistant',
      content: aiResponse.choices[0].message.content,
      contextData: Object.keys(contextData).length > 0 ? contextData : null
    });
    
    res.status(200).json({
      success: true,
      data: {
        message: assistantMessage.content,
        timestamp: assistantMessage.timestamp
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
 * @route   GET /api/ai/chat/history
 * @desc    Get chat history for a user
 * @access  Private
 */
router.get('/chat/history', async (req, res) => {
  try {
    const { projectId, fileId, limit = 50 } = sanitize(req.query);
    
    const query = { user: req.user.id };
    
    if (projectId) {
      query.project = projectId;
    }
    
    if (fileId) {
      query.file = fileId;
    }
    
    const chatHistory = await ChatMessage.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .sort({ timestamp: 1 });
    
    res.status(200).json({
      success: true,
      count: chatHistory.length,
      data: chatHistory
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
 * @route   POST /api/ai/insights/:fileId
 * @desc    Generate AI insights for a file
 * @access  Private
 */
router.post('/insights/:fileId', async (req, res) => {
  try {
    const { fileId } = sanitize(req.params);
    
    // Check if user has consented to AI data sharing
    const consent = await UserConsent.findOne({ user: req.user.id });
    
    if (!consent || !consent.aiDataSharing.consented) {
      return res.status(403).json({
        success: false,
        message: 'User has not consented to AI data sharing'
      });
    }
    
    // Get file data
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this file'
      });
    }
    
    // Get project info for context
    const project = await Project.findById(file.project);
    
    // Generate insights
    const insights = await generateInsightsFromData(
      file.processedData || file.originalData,
      project
    );
    
    // Save insights to project
    await Project.findByIdAndUpdate(
      file.project,
      {
        $push: {
          aiInsights: {
            content: insights.content,
            datasetRef: file._id.toString()
          }
        }
      }
    );
    
    res.status(200).json({
      success: true,
      data: {
        insights: insights.content,
        file: {
          id: file._id,
          name: file.name
        }
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
