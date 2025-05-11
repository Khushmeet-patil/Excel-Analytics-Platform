import { useState } from 'react';
import { Upload, X, Check, FileSpreadsheet } from 'lucide-react';
import { uploadExcelFile } from '../services/fileService';

export default function FileUploader({ projectId, onClose, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'success', 'error'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const invalidFiles = [];

    selectedFiles.forEach(file => {
      if (
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'text/csv' ||
        file.name.endsWith('.csv')
      ) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setErrorMessage(`Invalid file types: ${invalidFiles.join(', ')}. Please select Excel or CSV files only.`);
    } else {
      setErrorMessage('');
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage('');
    setUploadStatus(null);

    try {
      // Real progress tracking would be better with actual upload progress events
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) clearInterval(interval);
          return Math.min(prev + 10, 90);
        });
      }, 300);

      console.log("Uploading files to project:", projectId);
      // Upload files to the backend
      const result = await uploadExcelFile(projectId, files);
      console.log("Upload result:", result);

      clearInterval(interval);
      setUploadProgress(100);
      setUploadStatus('success');

      // Close the uploader after a brief delay
      setTimeout(() => {
        if (onUploadComplete) {
          onUploadComplete(result);
        }
        // Don't reload the page - let the parent component handle refreshing the files
      }, 1500);
    } catch (error) {
      console.error("Failed to upload files:", error);
      setUploadStatus('error');
      setErrorMessage(error.message || 'Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {!isUploading && uploadStatus !== 'success' && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 text-center cursor-pointer hover:border-green-500 transition-colors"
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            accept=".xls,.xlsx,.csv"
            className="hidden"
            onChange={handleFileChange}
            multiple
          />
          <Upload size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">
            {files.length > 0
              ? `${files.length} file(s) selected`
              : 'Click to select or drag and drop Excel/CSV files'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            You can select multiple files
          </p>
        </div>
      )}

      {/* Selected files list */}
      {files.length > 0 && !isUploading && uploadStatus !== 'success' && (
        <div className="mb-4 max-h-40 overflow-y-auto">
          <p className="text-sm font-medium mb-2">Selected Files:</p>
          {files.map((file, index) => (
            <div key={`${file.name}-${file.size}-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-1">
              <div className="flex items-center">
                <FileSpreadsheet size={16} className="text-green-600 mr-2" />
                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">Uploading {files.length} file(s)...</span>
            <span className="text-sm text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="flex items-center text-green-600 mb-4">
          <Check size={20} className="mr-2" />
          <span>Upload complete! Redirecting...</span>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="flex items-center text-red-600 mb-4">
          <X size={20} className="mr-2" />
          <span>{errorMessage || 'Upload failed. Please try again.'}</span>
        </div>
      )}

      {errorMessage && !uploadStatus && (
        <div className="flex items-center text-red-600 mb-4 text-sm">
          <X size={16} className="mr-2 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md"
          disabled={isUploading}
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading || uploadStatus === 'success'}
          className={`px-4 py-2 rounded-md ${
            files.length === 0 || isUploading || uploadStatus === 'success'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white'
          }`}
        >
          Upload {files.length > 0 ? `(${files.length})` : ''}
        </button>
      </div>
    </div>
  );
}
