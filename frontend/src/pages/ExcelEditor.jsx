import { useState, useEffect } from 'react';
import { ChevronLeft, Save, Download, RefreshCw, ExternalLink, PlusSquare, Trash2, AlertCircle } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getFileById } from '../services/fileService';
import DataGrid from '../components/DataGrid';
import AIInsightsPanel from '../components/AIInsightsPanel';
import { useAuth } from '../context/AuthContext';

export default function ExcelEditor() {
  const { projectId, fileId } = useParams();
  const [fileData, setFileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('raw'); // 'raw', 'preprocessed', 'normalized'
  const [showInsightsPanel, setShowInsightsPanel] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated) {
      setError('You must be logged in to view this page');
      setIsLoading(false);
      return;
    }

    const fetchFileData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!fileId) {
          setError("File ID is missing");
          setIsLoading(false);
          return;
        }

        console.log(`Fetching file with ID: ${fileId}`);

        try {
          const data = await getFileById(fileId);

          if (!data) {
            throw new Error("No data returned from API");
          }

          console.log("File data received:", data);

          // Check if we have data from Cloudinary
          if ((!data.originalData || !Array.isArray(data.originalData) || data.originalData.length === 0) &&
              (!data.processedData || !Array.isArray(data.processedData) || data.processedData.length === 0)) {

            if (data.cloudinaryUrl && data.cloudinaryUrl.startsWith('http')) {
              console.log("File has Cloudinary URL but no data:", data.cloudinaryUrl);
              throw new Error("Excel data could not be loaded from Cloudinary. Please try refreshing the page or contact support if the issue persists.");
            } else {
              throw new Error("No data available for this file");
            }
          }

          // Log data details for debugging
          console.log("Data details:", {
            hasOriginalData: !!data.originalData && Array.isArray(data.originalData),
            originalDataLength: Array.isArray(data.originalData) ? data.originalData.length : 0,
            hasProcessedData: !!data.processedData && Array.isArray(data.processedData),
            processedDataLength: Array.isArray(data.processedData) ? data.processedData.length : 0,
            hasColumns: !!data.columns && Array.isArray(data.columns),
            columnsLength: Array.isArray(data.columns) ? data.columns.length : 0
          });

          // Ensure we have the expected data structure
          const processedData = data.processedData || data.originalData || [];

          // Generate columns from data if they're not provided
          let columns = Array.isArray(data.columns) ? data.columns : [];

          // If we have data but no columns, generate them from the first row
          if (Array.isArray(processedData) && processedData.length > 0 && columns.length === 0) {
            console.log("No columns provided, generating from data...");
            const firstRow = processedData[0];
            if (firstRow && typeof firstRow === 'object') {
              columns = Object.keys(firstRow).map(key => ({
                id: key,
                name: key,
                type: typeof firstRow[key] === 'number' ? 'number' : 'string'
              }));
              console.log(`Generated ${columns.length} columns from data`);
            }
          }

          const fileWithData = {
            ...data,
            processedData: Array.isArray(processedData) ? processedData : [],
            originalData: Array.isArray(data.originalData) ? data.originalData : [],
            columns: columns
          };

          // Log data for debugging
          console.log(`Loaded file data: ${fileWithData.name}`);
          console.log(`Rows: ${fileWithData.processedData.length}`);
          console.log(`Columns: ${fileWithData.columns.length}`);

          if (fileWithData.columns.length > 0) {
            console.log("Column names:", fileWithData.columns.map(c => c.name).join(', '));
          }

          setFileData(fileWithData);
        } catch (apiError) {
          console.error("API error:", apiError);

          // Handle authentication errors
          if (apiError.message.includes('session has expired') ||
              apiError.message.includes('Authentication token is missing')) {
            setError('Your session has expired. Please log in again.');
            // Log the user out
            logout();
            // Redirect to login after a short delay
            setTimeout(() => navigate('/login'), 2000);
          } else {
            setError(apiError.message || "Failed to load file data");
          }
        }
      } catch (error) {
        console.error("Failed to fetch file data:", error);
        setError(error.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileData();
  }, [projectId, fileId, isAuthenticated, logout, navigate]);

  const handleSave = async () => {
    // In a real app, implement save functionality
    alert('Changes saved successfully!');
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      console.log('Refreshing file data from Cloudinary...');

      // Force refresh from Cloudinary
      const refreshedData = await getFileById(fileId, true);

      if (!refreshedData) {
        throw new Error("No data returned from API");
      }

      console.log("Refreshed file data received:", refreshedData);

      // Log data details for debugging
      console.log("Refreshed data details:", {
        hasOriginalData: !!refreshedData.originalData && Array.isArray(refreshedData.originalData),
        originalDataLength: Array.isArray(refreshedData.originalData) ? refreshedData.originalData.length : 0,
        hasProcessedData: !!refreshedData.processedData && Array.isArray(refreshedData.processedData),
        processedDataLength: Array.isArray(refreshedData.processedData) ? refreshedData.processedData.length : 0,
        hasColumns: !!refreshedData.columns && Array.isArray(refreshedData.columns),
        columnsLength: Array.isArray(refreshedData.columns) ? refreshedData.columns.length : 0
      });

      // Check if we have data from Cloudinary
      if ((!refreshedData.originalData || !Array.isArray(refreshedData.originalData) || refreshedData.originalData.length === 0) &&
          (!refreshedData.processedData || !Array.isArray(refreshedData.processedData) || refreshedData.processedData.length === 0)) {

        if (refreshedData.cloudinaryUrl && refreshedData.cloudinaryUrl.startsWith('http')) {
          console.log("File has Cloudinary URL but no data:", refreshedData.cloudinaryUrl);
          throw new Error("Excel data could not be loaded from Cloudinary. Please try refreshing again or contact support if the issue persists.");
        } else {
          throw new Error("No data available for this file");
        }
      }

      // Ensure we have the expected data structure
      const processedData = refreshedData.processedData || refreshedData.originalData || [];

      // Generate columns from data if they're not provided
      let columns = Array.isArray(refreshedData.columns) ? refreshedData.columns : [];

      // If we have data but no columns, generate them from the first row
      if (Array.isArray(processedData) && processedData.length > 0 && columns.length === 0) {
        console.log("No columns provided in refresh, generating from data...");
        const firstRow = processedData[0];
        if (firstRow && typeof firstRow === 'object') {
          columns = Object.keys(firstRow).map(key => ({
            id: key,
            name: key,
            type: typeof firstRow[key] === 'number' ? 'number' : 'string'
          }));
          console.log(`Generated ${columns.length} columns from refreshed data`);
        }
      }

      const fileWithData = {
        ...refreshedData,
        processedData: Array.isArray(processedData) ? processedData : [],
        originalData: Array.isArray(refreshedData.originalData) ? refreshedData.originalData : [],
        columns: columns
      };

      // Log refreshed data for debugging
      console.log(`Refreshed file data: ${fileWithData.name}`);
      console.log(`Rows: ${fileWithData.processedData.length}`);
      console.log(`Columns: ${fileWithData.columns.length}`);

      if (fileWithData.columns.length > 0) {
        console.log("Column names:", fileWithData.columns.map(c => c.name).join(', '));
      }

      setFileData(fileWithData);

    } catch (error) {
      console.error("Failed to refresh file data:", error);
      setError(error.message || "Failed to refresh data from Cloudinary");
    } finally {
      setIsRefreshing(false);
    }
  };

  const toolbarButtons = [
    { label: 'Raw Data', value: 'raw' },
    { label: 'Data Preprocessing', value: 'preprocessing' },
    { label: 'Data Normalization', value: 'normalization' },
    { label: 'Feature Engineering', value: 'features' },
    { label: 'Data Visualization', value: 'visualization' },
  ];

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 px-4">
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle size={24} className="mr-2" />
          <h2 className="text-xl font-semibold">Error</h2>
        </div>
        <p className="text-center text-gray-700 mb-4">{error}</p>
        <Link
          to={projectId ? `/projects/${projectId}` : '/dashboard'}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Go Back
        </Link>
      </div>
    );
  }

  // Show message if no data is available
  if (!fileData) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="flex items-center text-yellow-600 mb-4">
          <AlertCircle size={24} className="mr-2" />
          <h2 className="text-xl font-semibold">No Data Available</h2>
        </div>
        <p className="text-center text-gray-700 mb-4">
          The file data could not be loaded. This might be due to an issue with the file format or server connection.
        </p>
        <Link
          to={projectId ? `/projects/${projectId}` : '/dashboard'}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to={`/projects/${projectId}`}
            className="text-gray-600 flex items-center hover:text-green-600 mr-4"
          >
            <ChevronLeft size={20} />
            <span className="ml-1">Back</span>
          </Link>
          <h1 className="text-lg font-medium">{fileData.name}</h1>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md"
          >
            <Save size={18} className="mr-1" />
            Save
          </button>
          <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md">
            <Download size={18} className="mr-1" />
            Export
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center space-x-1">
        {toolbarButtons.map(button => (
          <button
            key={button.value}
            className={`px-4 py-2 rounded-md ${
              activeTab === button.value
                ? 'bg-green-100 text-green-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(button.value)}
          >
            {button.label}
          </button>
        ))}
      </div>

      {/* Action Toolbar - varies based on active tab */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center space-x-2">
        {activeTab === 'raw' && (
          <>
            <button
              className={`px-3 py-1.5 border border-gray-300 rounded-md text-sm flex items-center ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={14} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh from Cloudinary'}
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm flex items-center">
              <PlusSquare size={14} className="mr-1" />
              Add Column
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm flex items-center text-red-600">
              <Trash2 size={14} className="mr-1" />
              Delete Selected
            </button>
          </>
        )}

        {activeTab === 'preprocessing' && (
          <>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
              Remove Duplicates
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
              Handle Missing Values
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
              Filter Outliers
            </button>
          </>
        )}

        {activeTab === 'normalization' && (
          <>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
              Min-Max Scaling
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
              Z-Score Normalization
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
              Log Transform
            </button>
          </>
        )}

        {activeTab === 'features' && (
          <>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
              One-Hot Encoding
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
              Feature Extraction
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
              Principal Component Analysis
            </button>
          </>
        )}

        {activeTab === 'visualization' && (
          <>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
              Histogram
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
              Scatter Plot
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
              Box Plot
            </button>
          </>
        )}

        <div className="ml-auto">
          <button
            className="px-3 py-1.5 text-green-600 flex items-center text-sm"
            onClick={() => setShowInsightsPanel(!showInsightsPanel)}
          >
            <ExternalLink size={14} className="mr-1" />
            {showInsightsPanel ? 'Hide AI Insights' : 'Show AI Insights'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className={`flex-1 ${showInsightsPanel ? 'pr-4' : ''} overflow-auto`}>
          <DataGrid
            data={fileData.processedData || fileData.originalData || []}
            columns={fileData.columns || []}
            activeTab={activeTab}
          />
        </div>

        {/* AI Insights Panel */}
        {showInsightsPanel && (
          <div className="w-80 border-l border-gray-200 bg-white overflow-auto">
            <AIInsightsPanel fileData={fileData} activeTab={activeTab} />
          </div>
        )}
      </div>
    </div>
  );
}
