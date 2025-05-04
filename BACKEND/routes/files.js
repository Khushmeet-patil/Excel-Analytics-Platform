const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const XLSX = require('xlsx');
const File = require('../models/File');
const Project = require('../models/Project');

// Configure multer for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const ext = '.' + file.originalname.split('.').pop().toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed.'));
    }
  },
}).array('files', 10);

// Upload multiple files
router.post('/upload', auth, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const { projectId } = req.body;
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      const project = await Project.findOne({ _id: projectId, user: req.user.id });
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const uploadedFiles = [];
      for (const file of req.files) {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          continue;
        }

        const columns = jsonData[0].map(String);
        const data = jsonData.slice(1).map((row) => {
          return columns.reduce((obj, col, index) => {
            obj[col] = row[index] !== undefined ? row[index] : null;
            return obj;
          }, {});
        });

        const newFile = new File({
          user: req.user.id,
          project: projectId,
          filename: file.originalname,
          mimeType: file.mimetype,
          fileContent: file.buffer,
          modifiedFileContent: file.buffer,
          columns,
          data,
        });

        await newFile.save();
        project.files.push(newFile._id);
        project.chatHistory.push({
          message: `Uploaded file "${file.originalname}"`,
          fileId: newFile._id,
          timestamp: new Date(),
        });
        uploadedFiles.push({
          id: newFile._id,
          filename: newFile.filename,
          columns,
          sample: data.slice(0, 5),
        });
      }

      await project.save();
      res.json(uploadedFiles);
    } catch (err) {
      console.error('Error processing files:', err);
      res.status(500).json({ error: 'Server error processing files' });
    }
  });
});

// Get all files for a project
router.get('/projects/:projectId/files', auth, async (req, res) => {
  try {
    const files = await File.find({ project: req.params.projectId, user: req.user.id })
      .select('_id filename columns createdAt hasVisualization lastVisualization');
    res.json(files);
  } catch (err) {
    console.error('Error fetching project files:', err);
    res.status(500).json({ error: 'Server error fetching project files' });
  }
});

// Download modified file by ID
router.get('/files/:id/download-modified', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="modified_${file.filename}"`,
    });
    res.send(file.modifiedFileContent);
  } catch (err) {
    console.error(`Error downloading modified file ${req.params.id}:`, err);
    res.status(500).json({ error: 'Server error downloading modified file' });
  }
});

// Download original file by ID
router.get('/files/:id/download', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
    });
    res.send(file.fileContent);
  } catch (err) {
    console.error(`Error downloading original file ${req.params.id}:`, err);
    res.status(500).json({ error: 'Server error downloading original file' });
  }
});

// Get recent files
router.get('/recent', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const files = await File.find({ user: req.user.id })
      .select('_id filename columns createdAt hasVisualization lastVisualization project')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(files);
  } catch (err) {
    console.error('Error fetching recent files:', err);
    res.status(500).json({ error: 'Server error fetching recent files' });
  }
});

// Get file details
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id })
      .select('_id filename columns data createdAt hasVisualization lastVisualization project');

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const response = {
      _id: file._id,
      filename: file.filename,
      columns: file.columns,
      sample: file.data.slice(0, 5),
      createdAt: file.createdAt,
      hasVisualization: file.hasVisualization,
      lastVisualization: file.lastVisualization,
      project: file.project,
    };

    res.json(response);
  } catch (err) {
    console.error(`Error fetching file ${req.params.id}:`, err);
    res.status(500).json({ error: 'Server error fetching file' });
  }
});

// Preprocess file
router.post('/:id/preprocess', auth, async (req, res) => {
  try {
    const { operation, params } = req.body;
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const project = await Project.findById(file.project);
    if (!project || project.user.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Project not found' });
    }

    let updatedData = [...file.data];
    let updatedColumns = [...file.columns];
    let message = '';

    switch (operation) {
      case 'remove_nulls':
        updatedData = updatedData.filter((row) =>
          updatedColumns.every((col) => row[col] !== null && row[col] !== undefined)
        );
        message = `Removed rows with null values from file "${file.filename}"`;
        break;

      case 'normalize':
        const { method } = params || {};
        if (method !== 'min-max') {
          return res.status(400).json({ error: 'Unsupported normalization method' });
        }
        updatedColumns.forEach((col) => {
          const values = updatedData
            .map((row) => row[col])
            .filter((val) => typeof val === 'number' && !isNaN(val));
          if (values.length === 0) return;

          const min = Math.min(...values);
          const max = Math.max(...values);
          if (max === min) return;

          updatedData = updatedData.map((row) => ({
            ...row,
            [col]:
              typeof row[col] === 'number' && !isNaN(row[col])
                ? (row[col] - min) / (max - min)
                : row[col],
          }));
        });
        message = `Normalized numerical columns in file "${file.filename}" using min-max scaling`;
        break;

      case 'encode_categorical':
        updatedColumns.forEach((col) => {
          const uniqueValues = [...new Set(updatedData.map((row) => row[col]))].filter(
            (val) => val !== null && val !== undefined
          );
          const encodingMap = {};
          uniqueValues.forEach((val, index) => {
            encodingMap[val] = index;
          });

          updatedData = updatedData.map((row) => ({
            ...row,
            [col]: row[col] !== null && row[col] !== undefined ? encodingMap[row[col]] : row[col],
          }));
        });
        message = `Encoded categorical columns in file "${file.filename}"`;
        break;

      default:
        return res.status(400).json({ error: 'Unsupported preprocessing operation' });
    }

    const workbook = XLSX.utils.book_new();
    const worksheetData = [updatedColumns, ...updatedData.map((row) => updatedColumns.map((col) => row[col]))];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const modifiedBuffer = XLSX.write(workbook, { type: 'buffer', bookType: file.filename.endsWith('.csv') ? 'csv' : 'xlsx' });

    file.data = updatedData;
    file.modifiedFileContent = modifiedBuffer;
    await file.save();

    project.chatHistory.push({
      message,
      fileId: file._id,
      timestamp: new Date(),
    });
    await project.save();

    res.json({
      columns: file.columns,
      sample: file.data.slice(0, 5),
    });
  } catch (err) {
    console.error(`Error preprocessing file ${req.params.id}:`, err);
    res.status(500).json({ error: 'Server error preprocessing file' });
  }
});

// Get AI suggestions
router.get('/:id/ai-suggestions', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const suggestions = [];

    const nullCounts = file.columns.map((col) => {
      const nullCount = file.data.filter(
        (row) => row[col] === null || row[col] === undefined
      ).length;
      return { col, nullCount };
    });

    nullCounts.forEach(({ col, nullCount }) => {
      if (nullCount > 0) {
        suggestions.push({
          description: `Remove rows with null values in column "${col}" (${nullCount} nulls detected)`,
          operation: 'remove_nulls',
          params: {},
        });
      }
    });

    file.columns.forEach((col) => {
      const isNumerical = file.data.some(
        (row) => typeof row[col] === 'number' && !isNaN(row[col])
      );
      if (isNumerical) {
        suggestions.push({
          description: `Normalize column "${col}" using min-max scaling`,
          operation: 'normalize',
          params: { method: 'min-max' },
        });
      }
    });

    file.columns.forEach((col) => {
      const uniqueValues = [...new Set(file.data.map((row) => row[col]))].filter(
        (val) => val !== null && val !== undefined
      );
      if (uniqueValues.length > 0 && uniqueValues.length < 20) {
        suggestions.push({
          description: `Encode categorical values in column "${col}" (${uniqueValues.length} unique values)`,
          operation: 'encode_categorical',
          params: {},
        });
      }
    });

    res.json({ suggestions });
  } catch (err) {
    console.error(`Error generating AI suggestions for file ${req.params.id}:`, err);
    res.status(500).json({ error: 'Server error generating AI suggestions' });
  }
});

// Visualize data
router.post('/:id/visualize', auth, async (req, res) => {
  try {
    const { x, y, z, type, title, xLabel, yLabel, zLabel } = req.body;

    if (!x || !y) {
      return res.status(400).json({ error: 'X and Y axes are required' });
    }
    if (['scatter3d', 'surface'].includes(type) && !z) {
      return res.status(400).json({ error: 'Z axis is required for 3D charts' });
    }
    if (!['scatter', 'line', 'bar', 'histogram', 'box', 'scatter3d', 'surface'].includes(type)) {
      return res.status(400).json({ error: 'Unsupported chart type' });
    }

    const file = await File.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const project = await Project.findById(file.project);
    if (!project || project.user.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!file.columns.includes(x) || !file.columns.includes(y) || (z && !file.columns.includes(z))) {
      return res.status(400).json({ error: 'Selected column(s) not found in file' });
    }

    const requiresNumericY = ['scatter', 'line', 'bar', 'scatter3d', 'surface', 'histogram'];
    if (requiresNumericY.includes(type)) {
      const yValues = file.data.map((row) => row[y]).filter((val) => val !== null && val !== undefined);
      const isYNumeric = yValues.every((val) => typeof val === 'number' && !isNaN(val));
      if (!isYNumeric) {
        return res.status(400).json({ error: 'Y axis must contain numerical data for this chart type' });
      }
    }
    if (['scatter3d', 'surface'].includes(type)) {
      const zValues = file.data.map((row) => row[z]).filter((val) => val !== null && val !== undefined);
      const isZNumeric = zValues.every((val) => typeof val === 'number' && !isNaN(val));
      if (!isZNumeric) {
        return res.status(400).json({ error: 'Z axis must contain numerical data for this chart type' });
      }
    }

    let chartData;
    switch (type) {
      case 'histogram':
        chartData = file.data
          .filter((row) => row[x] !== null && row[x] !== undefined)
          .map((row) => ({ x: row[x] }));
        break;
      case 'box':
        const boxData = {};
        file.data.forEach((row) => {
          const xVal = row[x];
          if (xVal !== null && xVal !== undefined && row[y] !== null && row[y] !== undefined) {
            if (!boxData[xVal]) boxData[xVal] = [];
            if (typeof row[y] === 'number' && !isNaN(row[y])) {
              boxData[xVal].push(row[y]);
            }
          }
        });
        chartData = Object.keys(boxData).map((key) => ({
          x: key,
          y: boxData[key],
        }));
        break;
      default:
        chartData = file.data
          .filter((row) =>
            row[x] !== null &&
            row[x] !== undefined &&
            row[y] !== null &&
            row[y] !== undefined &&
            (!z || (row[z] !== null && row[z] !== undefined))
          )
          .map((row) => ({
            x: row[x],
            y: row[y],
            z: z ? row[z] : undefined,
          }));
    }

    if (chartData.length === 0) {
      return res.status(400).json({ error: 'No valid data available for the selected columns' });
    }

    // Create chart configuration for the client
    const chartConfig = {
      data: [{
        x: chartData.map((d) => d.x),
        y: chartData.map((d) => d.y),
        z: chartData.map((d) => d.z),
        type,
        mode: ['scatter', 'line'].includes(type) ? 'markers+lines' : undefined,
        marker: { size: 8 },
      }],
      layout: {
        title: title || `${y} vs ${x}`,
        xaxis: { title: xLabel || x },
        yaxis: { title: yLabel || y },
        zaxis: z ? { title: zLabel || z } : undefined,
        width: 800,
        height: 600,
      },
    };

    file.hasVisualization = true;
    file.lastVisualization = new Date();
    await file.save();

    const chartType = type.replace('3d', ' 3D').replace(/^\w/, (c) => c.toUpperCase());
    const zText = z ? ` and ${z} (Z)` : '';
    project.chatHistory.push({
      message: `Created a ${chartType} chart "${title || `${y} vs ${x}${zText}`}" for file "${file.filename}"`,
      fileId: file._id,
      chartConfig: { x, y, z, type, title, xLabel, yLabel, zLabel },
      timestamp: new Date(),
    });
    await project.save();

    res.json({
      chartData,
      config: { x, y, z, type, title, xLabel, yLabel, zLabel },
      chartConfig
    });
  } catch (err) {
    console.error(`Error generating visualization for file ${req.params.id}:`, err);
    res.status(500).json({ error: 'Server error generating visualization' });
  }
});

module.exports = router;