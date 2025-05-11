// routes/dataProcessingRoutes.js
const express = require('express');
const router = express.Router();
const File = require('../models/File');
const { verifyToken } = require('../middleware/authMiddleware');
const xlsx = require('xlsx');
const axios = require('axios');
const sanitize = require('mongo-sanitize');

// Comment out the middleware for testing
// router.use(verifyToken);

router.post('/preprocess/:fileId', async (req, res) => {
  try {
    const { fileId } = sanitize(req.params);
    const { operation, params } = sanitize(req.body);

    if (!operation) {
      return res.status(400).json({ success: false, message: 'Operation is required' });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to process this file' });
    }

    if (!file.originalData || file.originalData.length === 0) {
      const response = await axios.get(file.cloudinaryUrl, { responseType: 'arraybuffer' });
      let data = [];
      let columns = [];

      if (file.fileType === 'csv') {
        const workbook = xlsx.read(response.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = xlsx.utils.sheet_to_json(worksheet);
      } else {
        const workbook = xlsx.read(response.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = xlsx.utils.sheet_to_json(worksheet);
      }

      if (data.length > 0) {
        columns = Object.keys(data[0]).map(key => ({
          id: key,
          name: key,
          type: typeof data[0][key] === 'number' ? 'number' : 'string'
        }));
      }

      file.originalData = data;
      file.columns = columns;
      file.processedData = data;
      await file.save();
    }

    let dataToProcess = file.processedData || file.originalData;
    let processedData;

    switch (operation) {
      case 'removeDuplicates':
        const uniqueRows = new Map();
        processedData = dataToProcess.filter(row => {
          const key = JSON.stringify(row);
          if (!uniqueRows.has(key)) {
            uniqueRows.set(key, true);
            return true;
          }
          return false;
        });
        break;

      case 'handleMissingValues':
        const { strategy, columns } = params;
        processedData = [...dataToProcess];

        if (strategy === 'remove' && columns) {
          processedData = processedData.filter(row =>
            columns.every(col => row[col] != null && row[col] !== '')
          );
        } else if (strategy === 'fillMean' && columns) {
          columns.forEach(col => {
            const values = processedData
              .map(row => Number(row[col]))
              .filter(val => !isNaN(val));
            if (values.length > 0) {
              const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
              processedData.forEach(row => {
                if (row[col] == null || row[col] === '') {
                  row[col] = mean;
                }
              });
            }
          });
        } else if (strategy === 'fillZero' && columns) {
          columns.forEach(col => {
            processedData.forEach(row => {
              if (row[col] == null || row[col] === '') {
                row[col] = 0;
              }
            });
          });
        } else if (strategy === 'fillValue' && columns && params.value != null) {
          columns.forEach(col => {
            processedData.forEach(row => {
              if (row[col] == null || row[col] === '') {
                row[col] = params.value;
              }
            });
          });
        }
        break;

      case 'filterOutliers':
        const { column } = params;
        if (!column) {
          return res.status(400).json({ success: false, message: 'Column is required for outlier filtering' });
        }
        const values = dataToProcess
          .map(row => Number(row[column]))
          .filter(val => !isNaN(val));
        values.sort((a, b) => a - b);
        const q1 = values[Math.floor(values.length * 0.25)];
        const q3 = values[Math.floor(values.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        processedData = dataToProcess.filter(row => {
          const val = Number(row[column]);
          return !isNaN(val) && val >= lowerBound && val <= upperBound;
        });
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid operation' });
    }

    file.processedData = processedData;
    file.processHistory.push({ operation, params, timestamp: Date.now() });
    await file.save();

    res.status(200).json({ success: true, data: { file, processedData, operation, params } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.post('/normalize/:fileId', async (req, res) => {
  try {
    const { fileId } = sanitize(req.params);
    const { operation, columns } = sanitize(req.body);

    if (!operation || !columns || !Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({ success: false, message: 'Operation and columns are required' });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to process this file' });
    }

    let dataToProcess = file.processedData || file.originalData;
    if (!dataToProcess || !Array.isArray(dataToProcess) || dataToProcess.length === 0) {
      return res.status(400).json({ success: false, message: 'No data available for processing' });
    }

    let processedData = JSON.parse(JSON.stringify(dataToProcess));

    switch (operation) {
      case 'minMaxScaling':
        columns.forEach(column => {
          const values = processedData.map(row => Number(row[column])).filter(val => !isNaN(val));
          if (values.length > 0) {
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;
            if (range !== 0) {
              processedData.forEach(row => {
                if (!isNaN(Number(row[column]))) {
                  row[column] = (Number(row[column]) - min) / range;
                }
              });
            }
          }
        });
        break;

      case 'zScoreNormalization':
        columns.forEach(column => {
          const values = processedData.map(row => Number(row[column])).filter(val => !isNaN(val));
          if (values.length > 0) {
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            const std = Math.sqrt(variance);
            if (std !== 0) {
              processedData.forEach(row => {
                if (!isNaN(Number(row[column]))) {
                  row[column] = (Number(row[column]) - mean) / std;
                }
              });
            }
          }
        });
        break;

      case 'logTransform':
        columns.forEach(column => {
          processedData.forEach(row => {
            if (!isNaN(Number(row[column])) && Number(row[column]) >= 0) {
              row[column] = Math.log(Number(row[column]) + 1);
            }
          });
        });
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid operation' });
    }

    file.processedData = processedData;
    file.processHistory.push({ operation: `normalize_${operation}`, params: { columns }, timestamp: Date.now() });
    await file.save();

    res.status(200).json({ success: true, data: { file, processedData, operation, columns } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = sanitize(req.params);
    const { dataType } = sanitize(req.query);

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this file' });
    }

    const data = dataType === 'original' ? file.originalData : file.processedData;
    if (!data || data.length === 0) {
      return res.status(400).json({ success: false, message: 'No data available for download' });
    }

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename=${file.name}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;

