import { useState, useEffect } from 'react';
import { ChevronLeft, Upload, Settings, Edit, Trash } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProjectById } from '../services/projectService';
import { getProjectFiles } from '../services/fileService';
import FileUploader from '../components/FileUploader';
import FileList from '../components/FileList';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [projectFiles, setProjectFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if projectId is valid
        if (!projectId || projectId === 'undefined') {
          console.warn("Project ID is invalid or undefined, redirecting to projects page");
          navigate('/projects');
          return;
        }

        console.log(`Fetching project with ID: ${projectId}`);
        const projectData = await getProjectById(projectId);

        if (!projectData) {
          throw new Error("Project not found");
        }

        console.log("Project data received:", projectData);
        setProject(projectData);

        // Fetch files separately
        try {
          console.log(`Fetching files for project ID: ${projectId}`);
          const filesData = await getProjectFiles(projectId);
          console.log("Files data received:", filesData);
          setProjectFiles(filesData || []);
        } catch (fileError) {
          console.error("Failed to fetch project files:", fileError);
          // Don't fail the whole page if just files fail to load
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
        setError(error.message || "Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };

    // Immediate redirect if projectId is invalid
    if (!projectId || projectId === 'undefined') {
      console.warn("Project ID is invalid or undefined, redirecting to projects page");
      navigate('/projects');
      return;
    }

    // Only fetch if we have a valid projectId
    fetchProjectData();
  }, [projectId, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-4">Project Not Found</h2>
        <p className="text-gray-600 mb-6">
          {error || "The project you're looking for doesn't exist or you don't have access to it."}
        </p>
        <Link to="/projects" className="flex items-center text-green-600 hover:text-green-700">
          <ChevronLeft size={16} className="mr-2" />
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          to="/projects"
          className="text-gray-600 flex items-center hover:text-green-600"
        >
          <ChevronLeft size={20} />
          <span className="ml-1">Back to Projects</span>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-gray-600 mt-1">{project.description}</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md">
            <Settings size={16} className="mr-1" />
            Settings
          </button>
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-red-600">
            <Trash size={16} className="mr-1" />
            Delete
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Excel Files</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
          onClick={() => setShowUploader(true)}
        >
          <Upload size={16} className="mr-1" />
          Upload File
        </button>
      </div>

      {/* Use the separately fetched files instead of project.datasets */}
      <FileList files={projectFiles} projectId={projectId} />

      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Upload Excel File</h2>
            <FileUploader
              projectId={projectId}
              onClose={() => setShowUploader(false)}
              onUploadComplete={async () => {
                try {
                  // Refresh files after upload
                  const filesData = await getProjectFiles(projectId);
                  setProjectFiles(filesData || []);
                  setShowUploader(false);
                } catch (error) {
                  console.error("Failed to refresh files after upload:", error);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
