import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById } from '../services/projectService';
import { getFileById } from '../services/fileService';
import AIChat from '../components/AIChat';
import { ArrowLeft, FileSpreadsheet, FolderOpen } from 'lucide-react';

export default function AIChatPage() {
  const { projectId, fileId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch project data if projectId is provided
        if (projectId) {
          const projectData = await getProjectById(projectId);
          setProject(projectData);
        }

        // Fetch file data if fileId is provided
        if (fileId) {
          const fileData = await getFileById(fileId);
          setFile(fileData);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, fileId]);

  const handleBack = () => {
    if (fileId && projectId) {
      navigate(`/projects/${projectId}/files/${fileId}`);
    } else if (projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate('/projects');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back
          </button>
          <h1 className="text-xl font-semibold">AI Chat</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Context information */}
      {(project || file) && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            {project && (
              <div className="flex items-center bg-white px-3 py-2 rounded-md border border-gray-200">
                <FolderOpen size={16} className="mr-2 text-blue-600" />
                <span className="text-sm font-medium">Project: {project.name}</span>
              </div>
            )}
            {file && (
              <div className="flex items-center bg-white px-3 py-2 rounded-md border border-gray-200">
                <FileSpreadsheet size={16} className="mr-2 text-green-600" />
                <span className="text-sm font-medium">File: {file.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading and error states */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-red-50 text-red-700 p-4 rounded-md max-w-md">
            {error}
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <AIChat projectId={projectId} fileId={fileId} />
        </div>
      )}
    </div>
  );
}
