// routes/dataProcessingRoutes.js
const express = require('express');
const router = express.Router();
const File = require('../models/File');
const { verifyToken } = require('../middleware/authMiddleware');
const xlsx = require('xlsx');
const axios = require('axios');
const sanitize = require('mongo-sanitize');

// Apply authentication middleware to all routes
router.use(verifyToken);

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

router.post('/features/:fileId', async (req, res) => {
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

    let dataToProcess = file.processedData || file.originalData;
    if (!dataToProcess || !Array.isArray(dataToProcess) || dataToProcess.length === 0) {
      return res.status(400).json({ success: false, message: 'No data available for processing' });
    }

    let processedData = JSON.parse(JSON.stringify(dataToProcess));
    let newColumns = [...file.columns];

    switch (operation) {
      case 'oneHotEncoding':
        const { columns } = params;
        if (!columns || !Array.isArray(columns) || columns.length === 0) {
          return res.status(400).json({ success: false, message: 'Columns are required for one-hot encoding' });
        }

        columns.forEach(column => {
          // Get all unique values for this column
          const uniqueValues = new Set();
          processedData.forEach(row => {
            if (row[column] !== null && row[column] !== undefined && row[column] !== '') {
              uniqueValues.add(String(row[column]));
            }
          });

          // Create new columns for each unique value
          uniqueValues.forEach(value => {
            const newColumnName = `${column}_${value}`;

            // Add the new column to the columns array
            newColumns.push({
              id: newColumnName,
              name: newColumnName,
              type: 'number'
            });

            // Set the value for each row
            processedData.forEach(row => {
              row[newColumnName] = String(row[column]) === value ? 1 : 0;
            });
          });
        });
        break;

      case 'featureExtraction':
        const { sourceColumns, operation: extractionOperation, newColumnName } = params;

        if (!sourceColumns || !Array.isArray(sourceColumns) || sourceColumns.length === 0) {
          return res.status(400).json({ success: false, message: 'Source columns are required for feature extraction' });
        }

        if (!newColumnName) {
          return res.status(400).json({ success: false, message: 'New column name is required' });
        }

        // Add the new column to the columns array
        newColumns.push({
          id: newColumnName,
          name: newColumnName,
          type: 'number'
        });

        // Perform the extraction operation
        switch (extractionOperation) {
          case 'sum':
            processedData.forEach(row => {
              row[newColumnName] = sourceColumns.reduce((sum, col) => {
                const val = Number(row[col]);
                return sum + (isNaN(val) ? 0 : val);
              }, 0);
            });
            break;

          case 'average':
            processedData.forEach(row => {
              const values = sourceColumns.map(col => Number(row[col])).filter(val => !isNaN(val));
              row[newColumnName] = values.length > 0
                ? values.reduce((sum, val) => sum + val, 0) / values.length
                : 0;
            });
            break;

          case 'product':
            processedData.forEach(row => {
              row[newColumnName] = sourceColumns.reduce((product, col) => {
                const val = Number(row[col]);
                return product * (isNaN(val) ? 1 : val);
              }, 1);
            });
            break;

          default:
            return res.status(400).json({ success: false, message: 'Invalid extraction operation' });
        }
        break;

      case 'pca':
        // Simple PCA implementation (for demonstration purposes)
        // In a real application, you would use a more sophisticated library
        const { numComponents, targetColumns } = params;

        if (!targetColumns || !Array.isArray(targetColumns) || targetColumns.length === 0) {
          return res.status(400).json({ success: false, message: 'Target columns are required for PCA' });
        }

        if (!numComponents || numComponents <= 0) {
          return res.status(400).json({ success: false, message: 'Number of components must be positive' });
        }

        // Extract the data for the target columns
        const data = processedData.map(row =>
          targetColumns.map(col => {
            const val = Number(row[col]);
            return isNaN(val) ? 0 : val;
          })
        );

        // Center the data (subtract mean)
        const means = [];
        for (let j = 0; j < targetColumns.length; j++) {
          const columnValues = data.map(row => row[j]);
          const mean = columnValues.reduce((sum, val) => sum + val, 0) / columnValues.length;
          means.push(mean);
        }

        const centeredData = data.map(row =>
          row.map((val, j) => val - means[j])
        );

        // For simplicity, we'll just create random projections
        // In a real implementation, you would compute eigenvectors
        for (let i = 0; i < numComponents; i++) {
          const componentName = `PC${i+1}`;

          // Add the new component column
          newColumns.push({
            id: componentName,
            name: componentName,
            type: 'number'
          });

          // Generate a simple projection (this is a simplified approach)
          processedData.forEach((row, rowIndex) => {
            // Simple weighted sum of centered values
            row[componentName] = centeredData[rowIndex].reduce((sum, val, j) =>
              sum + val * (1 / (j + 1)), 0);
          });
        }
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid operation' });
    }

    file.processedData = processedData;
    file.columns = newColumns;
    file.processHistory.push({ operation: `features_${operation}`, params, timestamp: Date.now() });
    await file.save();

    res.status(200).json({ success: true, data: { file, processedData, operation, params } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.post('/save/:fileId', async (req, res) => {
  try {
    const { fileId } = sanitize(req.params);

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to save this file' });
    }

    // The file is already saved in the database after each operation
    // This endpoint is mainly for explicit save actions from the UI

    // Update the last modified timestamp
    file.updatedAt = Date.now();
    await file.save();

    res.status(200).json({
      success: true,
      message: 'File saved successfully',
      data: {
        file,
        lastSaved: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error saving file', error: error.message });
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

