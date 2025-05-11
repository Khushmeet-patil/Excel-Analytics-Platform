// models/Project.js
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  datasets: [{
    name: String,
    originalData: Array,
    processedData: Array,
    processHistory: [{
      operation: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      dataSnapshot: Object
    }]
  }],
  visualizations: [{
    title: String,
    type: String,
    config: Object,
    data: Array,
    createdAt: {
      type: Date,
      default: Date.now
    },
    datasetRef: String
  }],
  aiInsights: [{
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    datasetRef: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);