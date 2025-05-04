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
éticos
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8 relative">
        <button
          onClick={toggleAnalysisPanel}
          className="absolute top-4 left-4 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          title={isAnalysisPanelOpen ? 'Hide Analysis Panel' : 'Show Analysis Panel'}
        >
          {isAnalysisPanelOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{project?.name || 'Analysis Workspace'}</h1>
          <div className="flex space-x-4">
            <Link
              to={`/projects/${projectId}/upload`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Upload New File
            </Link>
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

        <div className="flex space-x-6">
          {isAnalysisPanelOpen && (
            <div className="w-80 bg-gray-50 p-6 rounded-lg shadow-inner flex flex-col space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Analysis Tools</h2>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select File</h3>
                <select
                  value={selectedFile?._id || ''}
                  onChange={(e) => handleFileSelect(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a file</option>
                  {files.map((file) => (
                    <option key={file._id} value={file._id}>{file.filename}</option>
                  ))}
                </select>
              </div>

              {aiSuggestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                    <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                    AI Suggestions
                  </h3>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg bg-white">
                        <p className="text-sm text-gray-700">{suggestion.description}</p>
                        <button
                          onClick={() => applyPreprocessing(suggestion.operation, suggestion.params)}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <Settings2 className="h-5 w-5 text-gray-500 mr-2" />
                  Data Preprocessing
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => applyPreprocessing('remove_nulls', {})}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-white"
                  >
                    <p className="text-sm font-medium text-gray-900">Remove Null Values</p>
                    <p className="text-xs text-gray-500">Eliminate rows with missing data</p>
                  </button>
                  <button
                    onClick={() => applyPreprocessing('normalize', { method: 'min-max' })}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-white"
                  >
                    <p className="text-sm font-medium text-gray-900">Normalize Data</p>
                    <p className="text-xs text-gray-500">Scale numerical columns to 0-1</p>
                  </button>
                  <button
                    onClick={() => applyPreprocessing('encode_categorical', {})}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-white"
                  >
                    <p className="text-sm font-medium text-gray-900">Encode Categorical</p>
                    <p className="text-xs text-gray-500">Convert categories to numbers</p>
                  </button>
                </div>
              </div>

              {selectedFile && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Download Datasets</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => downloadFile(selectedFile._id, 'original')}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-white w-full"
                    >
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">Download Original Dataset</span>
                    </button>
                    <button
                      onClick={() => downloadFile(selectedFile._id, 'modified')}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-white w-full"
                    >
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">Download Modified Dataset</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex-1">
            {!selectedFile && (
              <div className="text-center py-12">
                <h2 className="text-lg font-medium text-gray-900 mb-4">No Files Available</h2>
                <p className="text-sm text-gray-500 mb-6">Please upload a file to start analyzing data</p>
                <Link
                  to={`/projects/${projectId}/upload`}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Upload File
                </Link>
              </div>
            )}

            {selectedFile && (
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Create Visualization</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">X Axis</label>
                        <select
                          value={chartConfig.x}
                          onChange={(e) => setChartConfig((prev) => ({ ...prev, x: e.target.value }))}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="scatter">Scatter</option>
                          <option value="line">Line</option>
                          <option value="bar">Bar</option>
                          <option value="histogram">Histogram</option>
                          <option value="box">Box Plot</option>
                          <option value="scatter3d">3D Scatter</option>
                          <option value="surface">3D Surface</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chart Title</label>
                        <input
                          type="text"
                          value={chartConfig.title}
                          onChange={(e) => setChartConfig((prev) => ({ ...prev, title: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter chart title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">X Axis Label</label>
                        <input
                          type="text"
                          value={chartConfig.xLabel}
                          onChange={(e) => setChartConfig((prev) => ({ ...prev, xLabel: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter X axis label"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Y Axis Label</label>
                        <input
                          type="text"
                          value={chartConfig.yLabel}
                          onChange={(e) => setChartConfig((prev) => ({ ...prev, yLabel: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter Y axis label"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={generateVisualization}
                        disabled={isLoading}
                        className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isLoading ? 'Generating...' : 'Generate Visualization'}
                      </button>
                    </div>
                  </div>

                  {selectedChart ? (
                    <div className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
                      <img
                        src={selectedChart.chartImage}
                        alt="Historical Chart"
                        className="w-full h-auto rounded-lg"
                        style={{ maxHeight: isFullScreen ? '80vh' : '600px' }}
                      />
                      <div className="mt-4 flex justify-between items-center">
                        <div className="space-x-2">
                          <button
                            onClick={() => downloadChartFromHistory(selectedChart.chartImage, selectedChart.chartConfig?.title)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="h-5 w-5 mr-2" />
                            Download Chart
                          </button>
                          <button
                            onClick={toggleFullScreen}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                          >
                            <Maximize2 className="h-5 w-5 mr-2" />
                            {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                          </button>
                          <button
                            onClick={() => setSelectedChart(null)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                          >
                            Back to Current Chart
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : selectedFile?.chartData ? (
                    <div className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
                      <div ref={plotRef}>
                        <Plot
                          data={[
                            {
                              x: selectedFile.chartData.map((d) => d.x),
                              y: selectedFile.chartData.map((d) => d.y),
                              z: selectedFile.chartData.map((d) => d.z),
                              type: selectedFile.config.type,
                              mode: ['scatter', 'line'].includes(selectedFile.config.type) ? 'markers+lines' : undefined,
                              marker: { size: 8 },
                            },
                          ]}
                          layout={{
                            title: chartConfig.title || `${chartConfig.y} vs ${chartConfig.x}`,
                            scene: selectedFile.config.type.includes('3d')
                              ? {
                                  xaxis: { title: chartConfig.xLabel || chartConfig.x },
                                  yaxis: { title: chartConfig.yLabel || chartConfig.y },
                                  zaxis: { title: chartConfig.zLabel || chartConfig.z },
                                }
                              : {
                                  xaxis: { title: chartConfig.xLabel || chartConfig.x },
                                  yaxis: { title: chartConfig.yLabel || chartConfig.y },
                                },
                            height: isFullScreen ? window.innerHeight - 100 : 600,
                            width: isFullScreen ? window.innerWidth - 100 : undefined,
                          }}
                          config={{ responsive: true }}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="space-x-2">
                          <button
                            onClick={downloadChart}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="h-5 w-5 mr-2" />
                            Download Chart
                          </button>
                          <button
                            onClick={toggleFullScreen}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                          >
                            <Maximize2 className="h-5 w-5 mr-2" />
                            {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Data Preview</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {selectedFile.columns.map((column, idx) => (
                              <th
                                key={idx}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedFile.sample &&
                            selectedFile.sample.map((row, rowIdx) => (
                              <tr key={rowIdx}>
                                {selectedFile.columns.map((column, colIdx) => (
                                  <td
                                    key={colIdx}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                  >
                                    {row[column] !== undefined && row[column] !== null ? row[column] : 'N/A'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="col-span-1">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Analysis History</h2>
                  <div className="bg-gray-50 p-4 rounded-lg shadow-inner max-h-[600px] overflow-y-auto">
                    {project?.chatHistory?.length > 0 ? (
                      project.chatHistory
                        .slice()
                        .reverse()
                        .map((chat, index) => (
                          <div
                            key={index}
                            className="mb-4 p-3 bg-white rounded-md border border-gray-200 hover:bg-gray-100 cursor-pointer"
                            onClick={() => chat.chartImage && selectChartFromHistory(chat)}
                          >
                            <p className="text-sm text-gray-700">{chat.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatChatDate(chat.timestamp)}
                            </p>
                            {chat.chartConfig && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-900">
                                  Chart: {chat.chartConfig.title || `${chat.chartConfig.y} vs ${chat.chartConfig.x}`}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Type: {chat.chartConfig.type.replace('3d', ' 3D').replace(/^\w/, (c) => c.toUpperCase())}
                                </p>
                              </div>
                            )}
                            {chat.chartImage && (
                              <img
                                src={chat.chartImage}
                                alt="Chart Preview"
                                className="mt-2 w-full h-auto rounded-md"
                                style={{ maxHeight: '150px' }}
                              />
                            )}
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500">No analysis history available.</p>
                    )}
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