const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  files: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
    },
  ],
  chatHistory: [
    {
      message: {
        type: String,
        required: true,
      },
      fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
      },
      chartConfig: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
      chartImage: {
        type: String, // Store base64-encoded chart image
        default: null,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Project', ProjectSchema);