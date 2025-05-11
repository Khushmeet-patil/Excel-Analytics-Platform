import { FileSpreadsheet, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FileList({ files = [], projectId }) {
  // Ensure projectId is valid
  const validProjectId = projectId || '';

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!files || files.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No files available for this project.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {files.map((file, index) => {
        // Get file ID, handling both MongoDB _id and regular id
        const fileId = file.id || file._id || `file-${index}`;

        return (
          <div
            key={fileId}
            className={`p-4 flex items-center ${
              index < files.length - 1 ? 'border-b border-gray-200' : ''
            }`}
          >
            <div className="bg-green-50 p-3 rounded-md">
              <FileSpreadsheet size={24} className="text-green-600" />
            </div>

            <div className="ml-4 flex-1">
              <h3 className="font-medium">{file.name || 'Unnamed file'}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span className="flex items-center mr-4">
                  <Calendar size={14} className="mr-1" />
                  {formatDate(file.uploadedAt || file.createdAt)}
                </span>
                <span>{formatBytes(file.size || 0)}</span>
              </div>
            </div>

            <Link
              to={`/projects/${validProjectId}/files/${fileId}`}
              className="text-green-600 flex items-center"
            >
              Edit
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
