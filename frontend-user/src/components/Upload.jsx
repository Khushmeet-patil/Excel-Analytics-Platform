import { useState, useCallback, useEffect } from 'react';
import { Upload as UploadIcon, X, FileText, CloudUpload } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const Upload = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [project, setProject] = useState(null);

  const validFileTypes = ['.xlsx', '.xls', '.csv'];

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }

        const data = await response.json();
        setProject(data);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project');
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file) => {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!validFileTypes.includes(fileExtension)) {
      setError(`Invalid file type. Please upload only Excel (.xlsx, .xls) or CSV files.`);
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(`File size too large. Maximum size is 10MB.`);
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError('');

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(validateFile);

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  }, []);

  const handleFileSelect = (e) => {
    setError('');
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(validateFile);

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('projectId', projectId);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      await response.json();
      navigate(`/projects/${projectId}/analysis`);
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project ? `Upload Data for ${project.name}` : 'Upload Data'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Upload multiple Excel or CSV files for analysis
              </p>
            </div>
            <div className="flex space-x-4">
              {files.length > 0 && (
                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Uploading...' : 'Upload & Analyze'}
                </button>
              )}
              <Link
                to="/projects"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Back to Projects
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
              isDragging
                ? 'border-green-500 bg-green-50 scale-105'
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center">
              <CloudUpload className="h-16 w-16 text-gray-400 mb-4" />
              <div className="text-lg font-medium text-gray-900 mb-2">
                Drag and drop your Excel or CSV files here
              </div>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <label className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer transition-all duration-200 hover:scale-105">
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  multiple
                  onChange={handleFileSelect}
                />
                Browse Files
              </label>
              <p className="mt-4 text-xs text-gray-500">Maximum file size: 10MB (Multiple files supported)</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Selected Files</h2>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;