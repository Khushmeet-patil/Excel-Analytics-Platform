// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack trace:', err.stack);

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }

  // Cloudinary errors - expanded handling
  if (err.http_code || (err.message && err.message.includes('Cloudinary'))) {
    console.error('Cloudinary error details:', JSON.stringify(err));
    return res.status(err.http_code || 400).json({
      success: false,
      message: 'Cloudinary error',
      error: err.message,
      details: err.error || 'Error uploading file to cloud storage'
    });
  }

  // Handle file upload errors
  if (err.message && (
      err.message.includes('upload') ||
      err.message.includes('file') ||
      err.message.includes('storage')
    )) {
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: messages.join(', ')
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered',
      error: Object.keys(err.keyValue).join(', ')
    });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.stack
  });
};

module.exports = errorHandler;