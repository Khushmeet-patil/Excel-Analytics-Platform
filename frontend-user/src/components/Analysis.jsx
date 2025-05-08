import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Plot from 'react-plotly.js';
import {
  Download,
  Settings2,
  Lightbulb,
  Maximize2,
  FileText,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Upload, // Replace FileUpload with Upload
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

const Analysis = () => {
  const { projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [preprocessingOps, setPreprocessingOps] = useState([]);
  const [chartConfig, setChartConfig] = useState({
    x: '',
    y: '',
    z: '',
    type: 'scatter',
    title: '',
    xLabel: '',
    yLabel: '',
    zLabel: '',
  });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isAnalysisPanelOpen, setIsAnalysisPanelOpen] = useState(true);
  const [selectedChart, setSelectedChart] = useState(null);
  const plotRef = useRef(null);

  // Fetch project and files
  useEffect(() => {
    const fetchProjectAndFiles = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const projectResponse = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!projectResponse.ok) {
          const errorData = await projectResponse.json();
          throw new Error(errorData.error || 'Failed to fetch project');
        }

        const projectData = await projectResponse.json();
        setProject(projectData);

        const filesResponse = await fetch(`http://localhost:5000/api/files/projects/${projectId}/files`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!filesResponse.ok) {
          const errorData = await filesResponse.json();
          throw new Error(errorData.error || 'Failed to fetch project files');
        }

        const filesData = await filesResponse.json();
        setFiles(filesData);
        if (filesData.length > 0) {
          handleFileSelect(filesData[0]._id);
        } else {
          setError('No files found for this project. Please upload a file.');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching project/files:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectAndFiles();
  }, [projectId]);

  // Fetch file particulars and AI suggestions
  const handleFileSelect = async (fileId) => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/files/${fileId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch file');
      }

      const data = await response.json();
      setSelectedFile(data);
      setChartConfig({
        x: data.columns[0] || '',
        y: data.columns[1] || '',
        z: '',
        type: 'scatter',
        title: '',
        xLabel: '',
        yLabel: '',
        zLabel: '',
      });

      const suggestionsResponse = await fetch(`http://localhost:5000/api/files/${fileId}/ai-suggestions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!suggestionsResponse.ok) {
        const errorData = await suggestionsResponse.json();
        throw new Error(errorData.error || 'Failed to fetch AI suggestions');
      }

      const suggestionsData = await suggestionsResponse.json();
      setAiSuggestions(suggestionsData.suggestions || []);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply preprocessing operation
  const applyPreprocessing = async (operation, params) => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/files/${selectedFile._id}/preprocess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ operation, params }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Preprocessing failed');
      }

      const data = await response.json();
      setSelectedFile((prev) => ({
        ...prev,
        columns: data.columns,
        sample: data.sample,
      }));
      setPreprocessingOps((prev) => [...prev, { operation, params }]);

      const projectResponse = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const projectData = await projectResponse.json();
      setProject(projectData);
    } catch (err) {
      setError(err.message);
      console.error('Preprocessing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate visualization
  const generateVisualization = async () => {
    if (!chartConfig.x || !chartConfig.y || (is3DChart() && !chartConfig.z)) {
      setError('Please select required axes for the chart.');
      return;
    }

    if (!selectedFile) {
      setError('No file selected.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/files/${selectedFile._id}/visualize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(chartConfig),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate visualization');
      }

      const data = await response.json();
      setSelectedFile((prev) => ({
        ...prev,
        chartData: data.chartData,
        config: data.config,
        chartImage: data.chartImage,
      }));

      const projectResponse = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const projectData = await projectResponse.json();
      setProject(projectData);
      setSelectedChart(null);
    } catch (err) {
      setError(err.message);
      console.error('Visualization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Download chart as PNG
  const downloadChart = () => {
    if (selectedFile?.chartImage) {
      const link = document.createElement('a');
      link.href = selectedFile.chartImage;
      link.download = `chart-${chartConfig.x}-vs-${chartConfig.y}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Download chart from history
  const downloadChartFromHistory = (chartImage, title) => {
    const link = document.createElement('a');
    link.href = chartImage;
    link.download = title ? `chart-${title}.png` : 'chart.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download file (original or modified)
  const downloadFile = async (fileId, type) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint =
        type === 'original'
          ? `http://localhost:5000/api/files/${fileId}/download`
          : `http://localhost:5000/api/files/${fileId}/download-modified`;

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to download ${type} file`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = type === 'original' ? 'original_file' : 'modified_file';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
      console.error('Download error:', err);
    }
  };

  // Toggle full-screen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Toggle analysis panel
  const toggleAnalysisPanel = () => {
    setIsAnalysisPanelOpen(!isAnalysisPanelOpen);
  };

  // Select chart from history
  const selectChartFromHistory = (chart) => {
    setSelectedChart(chart);
  };

  // Check if chart is 3D
  const is3DChart = () => {
    return ['scatter3d', 'surface'].includes(chartConfig.type);
  };

  // Format chat date
  const formatChatDate = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  // Chart type name formatter
  const formatChartTypeName = (type) => {
    const types = {
      'scatter': 'Scatter Plot',
      'line': 'Line Chart',
      'bar': 'Bar Chart',
      'histogram': 'Histogram',
      'box': 'Box Plot',
      'scatter3d': '3D Scatter',
      'surface': '3D Surface'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-green-50">
      <div className="bg-white shadow-md flex flex-col">
        {/* Error Message */}
        {error && (
          <div className="mx-4 sm:mx-8 mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mx-4 sm:mx-8 mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Loading...</p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row h-full">
          {/* Analysis Panel - Collapsible on mobile */}
          <div className={`${isAnalysisPanelOpen ? 'block' : 'hidden'} md:block w-full md:w-80 bg-gray-50 border-r border-gray-200 p-4 md:p-5 overflow-y-auto`}>
            <div className="md:hidden flex justify-end mb-4">
              <button 
                onClick={toggleAnalysisPanel}
                className="p-2 rounded-md bg-gray-200 text-gray-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Data Source</h3>
                <select
                  value={selectedFile?._id || ''}
                  onChange={(e) => handleFileSelect(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select a file</option>
                  {files.map((file) => (
                    <option key={file._id} value={file._id}>{file.filename}</option>
                  ))}
                </select>
              </div>

              {aiSuggestions.length > 0 && (
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                  <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
                    AI Suggestions
                  </h3>
                  <div className="space-y-3">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 border border-blue-200 rounded-lg bg-white shadow-sm">
                        <p className="text-sm text-gray-700 mb-2">{suggestion.description}</p>
                        <button
                          onClick={() => applyPreprocessing(suggestion.operation, suggestion.params)}
                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <Settings2 className="h-4 w-4 text-gray-600 mr-2" />
                  Data Preprocessing
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => applyPreprocessing('remove_nulls', {})}
                    className="w-full px-4 py-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-green-50 transition-colors shadow-sm"
                  >
                    <p className="text-sm font-medium text-gray-800">Remove Null Values</p>
                    <p className="text-xs text-gray-500 mt-1">Eliminate rows with missing data</p>
                  </button>
                  <button
                    onClick={() => applyPreprocessing('normalize', { method: 'min-max' })}
                    className="w-full px-4 py-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-green-50 transition-colors shadow-sm"
                  >
                    <p className="text-sm font-medium text-gray-800">Normalize Data</p>
                    <p className="text-xs text-gray-500 mt-1">Scale numerical columns to 0-1</p>
                  </button>
                  <button
                    onClick={() => applyPreprocessing('encode_categorical', {})}
                    className="w-full px-4 py-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-green-50 transition-colors shadow-sm"
                  >
                    <p className="text-sm font-medium text-gray-800">Encode Categorical</p>
                    <p className="text-xs text-gray-500 mt-1">Convert categories to numbers</p>
                  </button>
                </div>
              </div>

              {selectedFile && (
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Download Options</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => downloadFile(selectedFile._id, 'original')}
                      className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <span className="text-sm text-gray-800">Original Dataset</span>
                      <FileText className="h-4 w-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => downloadFile(selectedFile._id, 'modified')}
                      className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <span className="text-sm text-gray-800">Modified Dataset</span>
                      <FileText className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-4 md:p-8 relative">
            {/* Toggle panel button - visible only on mobile */}
            {!isAnalysisPanelOpen && (
              <button 
                onClick={toggleAnalysisPanel}
                className="md:hidden fixed top-20 left-0 z-10 p-2 bg-green-600 text-white rounded-r-md"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            {!selectedFile && (
              <div className="flex flex-col items-center justify-center py-16 px-4 sm:px-8">
                <div className="bg-blue-50 p-6 sm:p-8 rounded-lg max-w-md text-center">
                  <BarChart3 className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                  <h2 className="text-xl font-bold text-gray-900 mb-3">No Files Available</h2>
                  <p className="text-gray-600 mb-6">Please upload a file to start analyzing your data</p>
                  <Link
                    to={`/projects/${projectId}/upload`}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload File
                  </Link>
                </div>
              </div>
            )}

            {selectedFile && (
              <div className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                  {/* Left Side - Visualization & Data */}
                  <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    {/* Visualization Settings */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="h-5 w-5 text-green-500 mr-2" />
                        Create Visualization
                      </h2>
                      
                      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">X Axis</label>
                          <select
                            value={chartConfig.x}
                            onChange={(e) => setChartConfig((prev) => ({ ...prev, x: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white"
                          >
                            <option value="">Select column</option>
                            {selectedFile.columns.map((column) => (
                              <option key={column} value={column}>{column}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Y Axis</label>
                          <select
                            value={chartConfig.y}
                            onChange={(e) => setChartConfig((prev) => ({ ...prev, y: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white"
                          >
                            <option value="">Select column</option>
                            {selectedFile.columns.map((column) => (
                              <option key={column} value={column}>{column}</option>
                            ))}
                          </select>
                        </div>
                        {is3DChart() && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Z Axis</label>
                            <select
                              value={chartConfig.z}
                              onChange={(e) => setChartConfig((prev) => ({ ...prev, z: e.target.value }))}
                              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white"
                            >
                              <option value="">Select column</option>
                              {selectedFile.columns.map((column) => (
                                <option key={column} value={column}>{column}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
                          <select
                            value={chartConfig.type}
                            onChange={(e) => setChartConfig((prev) => ({ ...prev, type: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white"
                          >
                            <option value="scatter">Scatter Plot</option>
                            <option value="line">Line Chart</option>
                            <option value="bar">Bar Chart</option>
                            <option value="histogram">Histogram</option>
                            <option value="box">Box Plot</option>
                            <option value="scatter3d">3D Scatter</option>
                            <option value="surface">3D Surface</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Chart Title</label>
                          <input
                            type="text"
                            value={chartConfig.title}
                            onChange={(e) => setChartConfig((prev) => ({ ...prev, title: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter chart title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">X Axis Label</label>
                          <input
                            type="text"
                            value={chartConfig.xLabel}
                            onChange={(e) => setChartConfig((prev) => ({ ...prev, xLabel: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter X axis label"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Y Axis Label</label>
                          <input
                            type="text"
                            value={chartConfig.yLabel}
                            onChange={(e) => setChartConfig((prev) => ({ ...prev, yLabel: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter Y axis label"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          onClick={generateVisualization}
                          disabled={isLoading}
                          className={`inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {isLoading ? 'Generating...' : 'Generate Visualization'}
                        </button>
                      </div>
                    </div>

                    {/* Visualization Display */}
                    {selectedChart ? (
                      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {selectedChart.chartConfig?.title || `${selectedChart.chartConfig?.y} vs ${selectedChart.chartConfig?.x}`}
                          </h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => downloadChartFromHistory(selectedChart.chartImage, selectedChart.chartConfig?.title)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </button>
                            <button
                              onClick={toggleFullScreen}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Maximize2 className="h-3 w-3 mr-1" />
                              {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
                            </button>
                            <button
                              onClick={() => setSelectedChart(null)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                            >
                              Back to Current
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <img
                            src={selectedChart.chartImage}
                            alt="Historical Chart"
                            className="w-full h-auto rounded-lg"
                            style={{ maxHeight: isFullScreen ? '80vh' : '500px' }}
                          />
                        </div>
                      </div>
                    ) : selectedFile?.chartData ? (
                      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
                        <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">
                            {chartConfig.title || `${chartConfig.y} vs ${chartConfig.x}`}
                          </h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={downloadChart}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </button>
                            <button
                              onClick={toggleFullScreen}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Maximize2 className="h-3 w-3 mr-1" />
                              {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <Plot
                            ref={plotRef}
                            data={selectedFile.chartData}
                            layout={{
                              title: chartConfig.title,
                              xaxis: { title: chartConfig.xLabel || chartConfig.x },
                              yaxis: { title: chartConfig.yLabel || chartConfig.y },
                              zaxis: is3DChart() ? { title: chartConfig.zLabel || chartConfig.z } : undefined,
                              autosize: true,
                              margin: { l: 50, r: 50, b: 50, t: 50 },
                            }}
                            useResizeHandler
                            style={{ width: '100%', height: isFullScreen ? '80vh' : '400px' }}
                            config={{ responsive: true }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
                        <p className="text-gray-500">Generate a visualization to see it here.</p>
                      </div>
                    )}

                    {/* Data Preview */}
                    {selectedFile?.sample && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Preview</h2>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {selectedFile.columns.map((column, index) => (
                                  <th
                                    key={index}
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    {column}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedFile.sample.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {selectedFile.columns.map((column, colIndex) => (
                                    <td
                                      key={colIndex}
                                      className="px-4 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                      {row[column] ?? 'N/A'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Side - Chart History */}
                  <div className="lg:col-span-1 space-y-6 md:space-y-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Chart History</h2>
                      {project?.charts?.length > 0 ? (
                        <div className="space-y-4">
                          {project.charts.map((chart, index) => (
                            <div
                              key={index}
                              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => selectChartFromHistory(chart)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="mr-2">
                                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                    {chart.chartConfig?.title || `${chart.chartConfig?.y} vs ${chart.chartConfig?.x}`}
                                  </p>
                                  <p className="text-xs text-gray-500">{formatChartTypeName(chart.chartConfig?.type)}</p>
                                  <p className="text-xs text-gray-400">{formatChatDate(chart.createdAt)}</p>
                                </div>
                                <img
                                  src={chart.chartImage}
                                  alt="Chart thumbnail"
                                  className="w-16 h-16 object-cover rounded flex-shrink-0"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No charts generated yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;



