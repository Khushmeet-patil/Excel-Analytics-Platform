// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

// Validate Cloudinary environment variables
const requiredCloudinaryVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingVars = requiredCloudinaryVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required Cloudinary environment variables:', missingVars);
  console.warn('Cloudinary integration will not work properly without these variables');
}

// Configure Cloudinary with error handling
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  // Test the configuration
  cloudinary.api.ping((error, result) => {
    if (error) {
      console.error('Cloudinary configuration test failed:', error.message);
    } else {
      console.log('Cloudinary configuration successful:', result.status);
    }
  });
} catch (error) {
  console.error('Error configuring Cloudinary:', error.message);
}

// Check if Cloudinary is properly configured
const cloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// Configure storage with proper resource type handling and error handling
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'excel-analytics',
    // Set resource_type based on file type
    resource_type: (req, file) => {
      // Log the file being uploaded for debugging
      console.log('Uploading file to Cloudinary:', file.originalname, file.mimetype);

      // For Excel and CSV files, use 'raw' resource type
      return 'raw';
    },
    // Generate unique filename
    public_id: (req, file) => {
      try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileNameWithoutExt = path.basename(
          file.originalname,
          path.extname(file.originalname)
        );
        const safeFileName = fileNameWithoutExt
          .replace(/[^a-zA-Z0-9]/g, '-') // Replace non-alphanumeric chars with hyphens
          .replace(/-+/g, '-')           // Replace multiple hyphens with a single one
          .substring(0, 40);             // Limit length

        return `${safeFileName}-${uniqueSuffix}`;
      } catch (error) {
        console.error('Error generating public_id for Cloudinary:', error);
        // Fallback to a simple timestamp-based name
        return `file-${Date.now()}`;
      }
    },
    // Keep the original file extension
    format: (req, file) => {
      try {
        const extension = path.extname(file.originalname).substring(1); // Remove the dot
        return extension || 'xlsx'; // Default to xlsx if no extension
      } catch (error) {
        console.error('Error determining file format for Cloudinary:', error);
        return 'xlsx'; // Default fallback
      }
    }
  }
});

// Configure multer with proper file filtering and error handling
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    try {
      console.log('Filtering file:', file.originalname, file.mimetype);

      const allowedMimes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/csv',
        'text/plain',
        'application/octet-stream' // Some browsers/clients may use this generic type
      ];

      const allowedExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = path.extname(file.originalname).toLowerCase();

      // Accept file if either extension or mimetype is valid
      if (allowedExtensions.includes(fileExtension) || allowedMimes.includes(file.mimetype)) {
        console.log(`File ${file.originalname} accepted`);
        cb(null, true);
      } else {
        console.warn(`File ${file.originalname} rejected: invalid type ${file.mimetype} or extension ${fileExtension}`);
        cb(new Error(`Only Excel and CSV files are allowed. Received: ${file.mimetype} with extension ${fileExtension}`), false);
      }
    } catch (error) {
      console.error('Error in file filter:', error);
      cb(new Error(`File validation error: ${error.message}`), false);
    }
  }
});

module.exports = {
  cloudinary,
  upload,
  cloudinaryConfigured
};