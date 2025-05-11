const express = require('express');
const router = express.Router();
const File = require('../models/File');
const Project = require('../models/Project');
const { verifyToken } = require('../middleware/authMiddleware');
const { cloudinary, upload, cloudinaryConfigured } = require('../config/cloudinary');
const xlsx = require('xlsx');
const sanitize = require('mongo-sanitize');
const fs = require('fs');
const path = require('path');
const os = require('os');
const multer = require('multer'); // Added missing import

// Apply middleware
router.use(verifyToken);

// Helper function to safely parse Excel/CSV files
const parseSpreadsheetFile = async (file) => {
  try {
    let workbook;
    console.log('Parsing spreadsheet file:', file.name, 'Type:', file.fileType);

    if (file.buffer) {
      console.log('Reading from buffer');
      workbook = xlsx.read(file.buffer, { type: 'buffer' });
    } else if (file.path || file.cloudinaryUrl) {
      const fileUrl = file.path || file.cloudinaryUrl;

      if (fileUrl.startsWith('http')) {
        console.log('Fetching file from Cloudinary URL:', fileUrl);
        try {
          // Use axios for better compatibility
          const axios = require('axios');

          console.log(`Attempting to fetch file from URL: ${fileUrl}`);

          // Check if the URL is valid
          if (!fileUrl || typeof fileUrl !== 'string') {
            throw new Error(`Invalid Cloudinary URL: ${fileUrl}`);
          }

          // Set a longer timeout for large files
          const response = await axios({
            method: 'get',
            url: fileUrl,
            responseType: 'arraybuffer',
            timeout: 60000, // 60 seconds timeout
            headers: {
              'Accept': '*/*',
              'Content-Type': 'application/octet-stream',
            }
          });

          console.log(`Axios response status: ${response.status}, data size: ${response.data ? response.data.byteLength : 'unknown'} bytes`);

          if (response.status !== 200) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
          }

          console.log(`Successfully fetched file from Cloudinary. Data size: ${response.data.byteLength} bytes`);

          // Use the data directly from axios response
          try {
            workbook = xlsx.read(response.data, { type: 'array' });
            console.log('Successfully parsed workbook from Cloudinary data');
          } catch (xlsxError) {
            console.error('Error parsing Excel data with xlsx:', xlsxError);
            throw new Error(`Failed to parse Excel data: ${xlsxError.message}`);
          }

        } catch (fetchError) {
          console.error('Error fetching file from URL:', fetchError);
          throw new Error(`Failed to fetch file from cloud storage: ${fetchError.message}`);
        }
      } else {
        console.log('Reading from local file path:', fileUrl);
        workbook = xlsx.readFile(fileUrl);
      }
    } else {
      throw new Error('Invalid file source - neither buffer nor path/cloudinaryUrl available');
    }

    // Validate workbook
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Invalid workbook structure or empty workbook');
    }

    console.log('Workbook sheets:', workbook.SheetNames);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error('No sheets found in the workbook');

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) throw new Error('Worksheet is empty or invalid');

    // Parse with error handling
    let data = [];
    try {
      data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
      console.log(`Successfully parsed worksheet to JSON. Rows: ${data.length}`);

      if (data.length === 0) {
        // Try to get the range to see if there's any data
        const range = xlsx.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        console.log('Worksheet range:', worksheet['!ref'], 'Decoded range:', range);

        // If there's data but sheet_to_json failed, try a different approach
        if (range.e.r > 0 || range.e.c > 0) {
          console.log('Trying alternative parsing method for worksheet');
          // Get headers from first row
          const headers = [];
          for (let c = range.s.c; c <= range.e.c; c++) {
            const cell = worksheet[xlsx.utils.encode_cell({ r: range.s.r, c })];
            headers.push(cell ? cell.v : `Column${c+1}`);
          }

          // Get data from remaining rows
          for (let r = range.s.r + 1; r <= range.e.r; r++) {
            const row = {};
            for (let c = range.s.c; c <= range.e.c; c++) {
              const cell = worksheet[xlsx.utils.encode_cell({ r, c })];
              row[headers[c - range.s.c]] = cell ? cell.v : '';
            }
            data.push(row);
          }
          console.log(`Alternative parsing found ${data.length} rows`);
        }
      }
    } catch (parseError) {
      console.error('Error parsing worksheet to JSON:', parseError);
      throw new Error(`Failed to parse worksheet: ${parseError.message}`);
    }

    let columns = [];
    if (data.length > 0) {
      columns = Object.keys(data[0]).map(key => ({
        id: key,
        name: key,
        type: typeof data[0][key] === 'number' ? 'number' : 'string'
      }));
      console.log(`Extracted ${columns.length} columns:`, columns.map(c => c.name).join(', '));
    } else {
      console.warn('No data rows found in the worksheet');
    }

    return { data, columns };
  } catch (error) {
    console.error('Error parsing spreadsheet:', error);
    throw error;
  }
};

// Create temporary storage for direct uploads when Cloudinary is unavailable
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(os.tmpdir(), 'excel-analytics');
    fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Fallback upload middleware for when Cloudinary is unavailable
const localUpload = multer({
  storage: tempStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv',
      'text/plain',
      'application/octet-stream'
    ];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension === '.csv' || allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'), false);
    }
  }
});

// Memory storage for CSV uploads
const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (extension === '.csv') {
      file.mimetype = 'text/csv'; // Force CSV mimetype
      return cb(null, true);
    }
    cb(new Error('Only CSV files are allowed for this endpoint'), false);
  }
});

// File upload route
router.post('/upload/:projectId', upload.array('files', 10), async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if project exists and belongs to user
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to upload to this project' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    console.log('Files received:', req.files.map(f => ({ name: f.originalname, path: f.path })));

    const uploadedFiles = [];
    const failedFiles = [];

    // Process each uploaded file with better error handling
    for (const file of req.files) {
      try {
        // Determine file type from extension
        const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);

        // Validate the Cloudinary response
        if (!file.path) {
          throw new Error('File upload to Cloudinary failed - no path returned');
        }

        // Create file record in database
        const newFile = await File.create({
          name: file.originalname,
          originalName: file.originalname,
          fileType: fileExtension,
          size: file.size,
          cloudinaryId: file.filename || file.path.split('/').pop(),
          cloudinaryUrl: file.path,
          project: projectId,
          owner: req.user.id
        });

        console.log('File successfully processed:', file.originalname);
        uploadedFiles.push(newFile);
      } catch (fileError) {
        console.error('Error processing file:', file.originalname, fileError);
        failedFiles.push({
          name: file.originalname,
          error: fileError.message
        });
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were successfully processed',
        failedFiles
      });
    }

    res.status(201).json({
      success: true,
      count: uploadedFiles.length,
      data: uploadedFiles,
      failedFiles: failedFiles.length > 0 ? failedFiles : undefined
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload',
      error: error.message
    });
  }
});

// Memory-based CSV upload route
router.post('/upload-memory/:projectId', verifyToken, memoryUpload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const { projectId } = sanitize(req.params);

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      if (project.owner.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to upload to this project' });
      }

      const csvString = req.file.buffer.toString('utf8');
      const rows = csvString.split('\n');
      const headers = rows[0].split(',');

      const data = [];
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;

        const values = rows[i].split(',');
        const row = {};

        for (let j = 0; j < headers.length; j++) {
          if (j < values.length) {
            const value = values[j];
            row[headers[j]] = isNaN(value) ? value : Number(value);
          }
        }

        data.push(row);
      }

      const columns = headers.map(header => ({
        id: header,
        name: header,
        type: (data[0] && typeof data[0][header] === 'number') ? 'number' : 'string'
      }));

      const newFile = await File.create({
        name: req.file.originalname,
        originalName: req.file.originalname,
        fileType: 'csv',
        size: req.file.size,
        cloudinaryId: 'memory_upload_' + Date.now(),
        cloudinaryUrl: 'memory://upload',
        project: projectId,
        owner: req.user.id,
        originalData: data,
        processedData: data,
        columns
      });

      res.status(201).json({ success: true, data: newFile });
    } catch (error) {
      console.error('Error in memory CSV upload:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });

// Get files for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = sanitize(req.params);

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this project' });
    }

    const files = await File.find({ project: projectId });

    // Check if any files need data loaded from Cloudinary
    // We don't want to block the response, so we'll just log errors
    for (const file of files) {
      if ((!file.originalData || !file.processedData) && file.cloudinaryUrl && file.cloudinaryUrl.startsWith('http')) {
        try {
          console.log(`Loading file data from Cloudinary URL: ${file.cloudinaryUrl}`);
          const { data, columns } = await parseSpreadsheetFile(file);

          // Update the file with the parsed data
          file.originalData = data;
          file.processedData = data;
          file.columns = columns;
          await file.save();

          console.log(`Successfully loaded data from Cloudinary for file: ${file._id}`);
        } catch (parseError) {
          console.error(`Failed to load data from Cloudinary for file: ${file._id}`, parseError);
          // Continue with other files
        }
      }
    }

    res.status(200).json({ success: true, count: files.length, data: files });
  } catch (error) {
    console.error('Error retrieving project files:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get a single file
router.get('/:id', async (req, res) => {
  try {
    const { id } = sanitize(req.params);
    const forceRefresh = req.query.refresh === 'true';

    console.log(`Getting file with ID: ${id}, Force refresh: ${forceRefresh}`);

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this file' });
    }

    // Log file details for debugging
    console.log('File details:', {
      id: file._id,
      name: file.name,
      fileType: file.fileType,
      cloudinaryId: file.cloudinaryId,
      cloudinaryUrl: file.cloudinaryUrl,
      hasOriginalData: !!file.originalData && Array.isArray(file.originalData) && file.originalData.length > 0,
      hasProcessedData: !!file.processedData && Array.isArray(file.processedData) && file.processedData.length > 0,
      columnsCount: Array.isArray(file.columns) ? file.columns.length : 0
    });

    // Check if we need to load data from Cloudinary
    const needsDataLoad = (!file.originalData || !file.processedData ||
                          !Array.isArray(file.originalData) || !Array.isArray(file.processedData) ||
                          file.originalData.length === 0 || file.processedData.length === 0 ||
                          forceRefresh) &&
                          file.cloudinaryUrl && typeof file.cloudinaryUrl === 'string' && file.cloudinaryUrl.startsWith('http');

    // Variable to hold parsed data in case we can't save to DB
    let parsedData = null;
    let parsedColumns = null;

    if (needsDataLoad) {
      try {
        console.log(`Loading file data from Cloudinary URL: ${file.cloudinaryUrl}`);

        // Validate Cloudinary URL
        if (!file.cloudinaryUrl || typeof file.cloudinaryUrl !== 'string' || !file.cloudinaryUrl.startsWith('http')) {
          throw new Error(`Invalid Cloudinary URL: ${file.cloudinaryUrl}`);
        }

        // Fetch and parse the Excel file from Cloudinary
        const { data, columns } = await parseSpreadsheetFile(file);

        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error('No data could be extracted from the Excel file');
        }

        console.log(`Parsed data from Cloudinary file. Rows: ${data.length}, Columns: ${columns.length}`);

        // Store the parsed data in case we can't save to DB
        parsedData = data;
        parsedColumns = columns;

        // Don't try to save to the database anymore, just use the parsed data
        console.log(`Successfully loaded data from Cloudinary for file: ${file._id}`);
        console.log(`Will return parsed data directly without saving to database`);

        // We'll use the parsed data in the response below
      } catch (parseError) {
        console.error(`Failed to load data from Cloudinary for file: ${file._id}`, parseError);
        return res.status(500).json({
          success: false,
          message: 'Failed to load Excel data from Cloudinary',
          error: parseError.message
        });
      }
    } else if (!file.originalData || !file.processedData ||
               !Array.isArray(file.originalData) || !Array.isArray(file.processedData) ||
               file.originalData.length === 0 || file.processedData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File data is not available and could not be loaded from storage'
      });
    }

    // If we have parsed data but couldn't save it to DB, use it in the response
    if (parsedData && parsedColumns) {
      // Create a temporary response object with the parsed data
      // This won't be saved to the database but will be returned to the client
      const responseFile = {
        ...file.toObject(),
        originalData: parsedData,
        processedData: parsedData,
        columns: parsedColumns.map(col => ({
          id: col.id || '',
          name: col.name || '',
          type: col.type || 'string'
        }))
      };

      // Return the temporary response object instead of the database object
      return res.status(200).json({ success: true, data: responseFile });
    }

    res.status(200).json({ success: true, data: file });
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete a file
router.delete('/:id', async (req, res) => {
  try {
    const { id } = sanitize(req.params);

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this file' });
    }

    if (file.cloudinaryUrl && file.cloudinaryUrl.startsWith('http')) {
      try {
        await cloudinary.uploader.destroy(file.cloudinaryId, { resource_type: 'raw' });
      } catch (cloudError) {
        console.error('Error deleting from Cloudinary:', cloudError);
      }
    }

    await file.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
