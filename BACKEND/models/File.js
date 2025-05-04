const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  filename: {
    type: String,
    required: true,
    trim: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  fileContent: {
    type: Buffer,
    required: true,
  },
  modifiedFileContent: {
    type: Buffer,
    required: true,
  },
  columns: [String],
  data: [mongoose.Schema.Types.Mixed],
  hasVisualization: {
    type: Boolean,
    default: false,
  },
  lastVisualization: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('File', fileSchema);