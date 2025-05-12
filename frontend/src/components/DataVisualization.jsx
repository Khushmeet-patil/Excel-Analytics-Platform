import { useState, useEffect, useRef } from 'react';
import { Download, X, ChevronDown, ChevronUp, Maximize, ExternalLink, Palette } from 'lucide-react';
import Chart from 'chart.js/auto';
import Plot from 'react-plotly.js';
import ThreeJSVisualization from './ThreeJSVisualization';
import FullScreenView from './FullScreenView';

export default function DataVisualization({ data, columns, onSave }) {
  const [chartType, setChartType] = useState('bar');
  const [chartCategory, setChartCategory] = useState('simple');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [chartTitle, setChartTitle] = useState('');
  const [chartInstance, setChartInstance] = useState(null);
  const [plotlyData, setPlotlyData] = useState(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [is3DChart, setIs3DChart] = useState(false);
  const chartRef = useRef(null);
  const plotlyRef = useRef(null);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [columnColors, setColumnColors] = useState({});

  // Clean up chart instance when component unmounts
  useEffect(() => {
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [chartInstance]);

  // Reset selected columns when chart type changes
  useEffect(() => {
    setSelectedColumns([]);
  }, [chartType]);

  const handleColumnToggle = (columnId) => {
    setSelectedColumns(prev => {
      if (prev.includes(columnId)) {
        // Remove column from selection
        const newSelection = prev.filter(id => id !== columnId);
        return newSelection;
      } else {
        // Add column to selection and assign a default color
        if (!columnColors[columnId]) {
          setColumnColors(prev => ({
            ...prev,
            [columnId]: getRandomColor()
          }));
        }
        return [...prev, columnId];
      }
    });
  };

  // Update color for a specific column
  const handleColorChange = (columnId, color) => {
    setColumnColors(prev => ({
      ...prev,
      [columnId]: color
    }));

    // If we have an active chart, regenerate it with the new colors
    if (chartInstance || plotlyData) {
      generateChart();
    }
  };

  const generateChart = () => {
    if (selectedColumns.length === 0) return;

    // Filter numeric columns for chart data
    const numericColumns = columns.filter(col =>
      col.type === 'number' && selectedColumns.includes(col.id)
    );

    if (numericColumns.length === 0) {
      alert('Please select at least one numeric column for visualization');
      return;
    }

    // For 3D charts, we don't need to do anything here as the ThreeJSVisualization component handles rendering
    if (is3DChart) {
      return;
    }

    // For Chart.js charts (simple charts)
    if (['bar', 'line', 'pie', 'scatter', 'doughnut'].includes(chartType)) {
      if (!chartRef.current) return;

      // Destroy previous chart if it exists
      if (chartInstance) {
        chartInstance.destroy();
      }

      // Prepare data for the chart
      const labels = data.map((_, index) => `Row ${index + 1}`);
      const datasets = numericColumns.map(column => {
        // Use custom color if available, otherwise use a random color
        const color = columnColors[column.id] || getRandomColor();
        return {
          label: column.name,
          data: data.map(row => row[column.id]),
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1
        };
      });

      // Create chart configuration
      const config = {
        type: chartType,
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: !!chartTitle,
              text: chartTitle
            },
            legend: {
              position: 'top',
            }
          }
        }
      };

      // Create new chart
      const newChartInstance = new Chart(chartRef.current, config);
      setChartInstance(newChartInstance);
      setPlotlyData(null);
    }
    // For Plotly charts (advanced charts)
    else {
      // Destroy previous Chart.js chart if it exists
      if (chartInstance) {
        chartInstance.destroy();
        setChartInstance(null);
      }

      // Prepare data for Plotly
      const plotlyConfig = createPlotlyConfig(chartType, numericColumns);
      setPlotlyData(plotlyConfig);
    }
  };

  // Create Plotly configuration based on chart type
  const createPlotlyConfig = (chartType, numericColumns) => {
    // Basic validation
    if (numericColumns.length === 0) return null;

    // Prepare data arrays
    const xValues = data.map(row => row[numericColumns[0].id]);
    const yValues = numericColumns.length > 1
      ? data.map(row => row[numericColumns[1].id])
      : data.map((_, i) => i);
    const zValues = numericColumns.length > 2
      ? data.map(row => row[numericColumns[2].id])
      : null;

    // Default layout
    const layout = {
      title: chartTitle,
      autosize: true,
      margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 }
    };

    // Create configuration based on chart type
    switch (chartType) {
      // Distribution charts
      case 'box':
        return {
          data: numericColumns.map(col => ({
            type: 'box',
            y: data.map(row => row[col.id]),
            name: col.name,
            boxpoints: 'all',
            jitter: 0.3,
            pointpos: -1.8,
            marker: { color: columnColors[col.id] || getRandomColor() }
          })),
          layout: {
            ...layout,
            title: chartTitle || 'Box Plot'
          }
        };

      case 'violin':
        return {
          data: numericColumns.map(col => ({
            type: 'violin',
            y: data.map(row => row[col.id]),
            name: col.name,
            box: { visible: true },
            meanline: { visible: true },
            line: { color: columnColors[col.id] || getRandomColor() },
            fillcolor: columnColors[col.id] || getRandomColor()
          })),
          layout: {
            ...layout,
            title: chartTitle || 'Violin Plot'
          }
        };

      case 'histogram':
        return {
          data: numericColumns.map(col => ({
            type: 'histogram',
            x: data.map(row => row[col.id]),
            name: col.name,
            opacity: 0.7,
            marker: { color: columnColors[col.id] || getRandomColor() }
          })),
          layout: {
            ...layout,
            title: chartTitle || 'Histogram',
            barmode: 'overlay'
          }
        };

      case 'histogram2d':
        if (numericColumns.length < 2) {
          alert('2D Histogram requires at least 2 numeric columns');
          return null;
        }

        // For 2D histogram, we'll use a custom colorscale based on the first two columns
        const color1 = columnColors[numericColumns[0].id] || 'rgba(0,0,255,1)';
        const color2 = columnColors[numericColumns[1].id] || 'rgba(255,0,0,1)';

        return {
          data: [{
            type: 'histogram2d',
            x: xValues,
            y: yValues,
            colorscale: [
              [0, color1],
              [1, color2]
            ]
          }],
          layout: {
            ...layout,
            title: chartTitle || '2D Histogram'
          }
        };

      case 'histogram2dcontour':
        if (numericColumns.length < 2) {
          alert('2D Contour Histogram requires at least 2 numeric columns');
          return null;
        }

        // For 2D contour histogram, we'll use a custom colorscale based on the first two columns
        const contourColor1 = columnColors[numericColumns[0].id] || 'rgba(0,0,255,1)';
        const contourColor2 = columnColors[numericColumns[1].id] || 'rgba(255,0,0,1)';

        return {
          data: [{
            type: 'histogram2dcontour',
            x: xValues,
            y: yValues,
            colorscale: [
              [0, contourColor1],
              [1, contourColor2]
            ]
          }],
          layout: {
            ...layout,
            title: chartTitle || '2D Contour Histogram'
          }
        };

      // Map charts
      case 'choropleth':
        // For choropleth, we'll use a custom colorscale based on selected columns
        const choroColor1 = numericColumns.length > 0 ?
          (columnColors[numericColumns[0].id] || 'rgba(0,0,255,1)') : 'rgba(0,0,255,1)';
        const choroColor2 = numericColumns.length > 1 ?
          (columnColors[numericColumns[1].id] || 'rgba(255,0,0,1)') : 'rgba(255,0,0,1)';

        return {
          data: [{
            type: 'choropleth',
            locationmode: 'country names',
            locations: ['USA', 'Canada', 'Mexico', 'France', 'Germany', 'UK', 'China', 'Japan', 'Australia', 'Brazil'],
            z: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            colorscale: [
              [0, choroColor1],
              [1, choroColor2]
            ]
          }],
          layout: {
            ...layout,
            title: chartTitle || 'Choropleth Map',
            geo: { projection: { type: 'robinson' } }
          }
        };

      // Finance charts
      case 'candlestick':
        // For candlestick, we can customize the increasing/decreasing colors
        const increasingColor = numericColumns.length > 0 ?
          (columnColors[numericColumns[0].id] || 'rgba(0,255,0,1)') : 'rgba(0,255,0,1)';
        const decreasingColor = numericColumns.length > 1 ?
          (columnColors[numericColumns[1].id] || 'rgba(255,0,0,1)') : 'rgba(255,0,0,1)';

        return {
          data: [{
            type: 'candlestick',
            x: data.map((_, i) => new Date(2023, 0, i + 1)),
            open: data.map((row, i) => numericColumns[0] ? row[numericColumns[0].id] : 100 + Math.random() * 10),
            high: data.map((row, i) => numericColumns[1] ? row[numericColumns[1].id] : 110 + Math.random() * 10),
            low: data.map((row, i) => numericColumns[2] ? row[numericColumns[2].id] : 90 + Math.random() * 10),
            close: data.map((row, i) => numericColumns[3] ? row[numericColumns[3].id] : 105 + Math.random() * 10),
            increasing: { line: { color: increasingColor } },
            decreasing: { line: { color: decreasingColor } }
          }],
          layout: {
            ...layout,
            title: chartTitle || 'Candlestick Chart'
          }
        };

      case 'ohlc':
        // For OHLC, we can customize the increasing/decreasing colors
        const ohlcIncreasingColor = numericColumns.length > 0 ?
          (columnColors[numericColumns[0].id] || 'rgba(0,255,0,1)') : 'rgba(0,255,0,1)';
        const ohlcDecreasingColor = numericColumns.length > 1 ?
          (columnColors[numericColumns[1].id] || 'rgba(255,0,0,1)') : 'rgba(255,0,0,1)';

        return {
          data: [{
            type: 'ohlc',
            x: data.map((_, i) => new Date(2023, 0, i + 1)),
            open: data.map((row, i) => numericColumns[0] ? row[numericColumns[0].id] : 100 + Math.random() * 10),
            high: data.map((row, i) => numericColumns[1] ? row[numericColumns[1].id] : 110 + Math.random() * 10),
            low: data.map((row, i) => numericColumns[2] ? row[numericColumns[2].id] : 90 + Math.random() * 10),
            close: data.map((row, i) => numericColumns[3] ? row[numericColumns[3].id] : 105 + Math.random() * 10),
            increasing: { line: { color: ohlcIncreasingColor } },
            decreasing: { line: { color: ohlcDecreasingColor } }
          }],
          layout: {
            ...layout,
            title: chartTitle || 'OHLC Chart'
          }
        };

      // Specialized charts
      case 'sunburst':
        // For sunburst, we'll create a custom color array based on selected columns
        const sunburstColors = Object.values(columnColors).length > 0
          ? Object.values(columnColors)
          : [
              'rgba(255,0,0,0.7)', 'rgba(0,255,0,0.7)', 'rgba(0,0,255,0.7)',
              'rgba(255,255,0,0.7)', 'rgba(255,0,255,0.7)', 'rgba(0,255,255,0.7)'
            ];

        return {
          data: [{
            type: 'sunburst',
            labels: ['Root', 'A', 'B', 'C', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
            parents: ['', 'Root', 'Root', 'Root', 'A', 'A', 'B', 'B', 'C', 'C'],
            values: [10, 20, 30, 40, 15, 5, 10, 20, 25, 15],
            marker: { colors: sunburstColors }
          }],
          layout: {
            ...layout,
            title: chartTitle || 'Sunburst Chart'
          }
        };

      case 'treemap':
        // For treemap, we'll create a custom color array based on selected columns
        const treemapColors = Object.values(columnColors).length > 0
          ? Object.values(columnColors)
          : [
              'rgba(255,0,0,0.7)', 'rgba(0,255,0,0.7)', 'rgba(0,0,255,0.7)',
              'rgba(255,255,0,0.7)', 'rgba(255,0,255,0.7)', 'rgba(0,255,255,0.7)'
            ];

        return {
          data: [{
            type: 'treemap',
            labels: ['Root', 'A', 'B', 'C', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
            parents: ['', 'Root', 'Root', 'Root', 'A', 'A', 'B', 'B', 'C', 'C'],
            values: [10, 20, 30, 40, 15, 5, 10, 20, 25, 15],
            marker: { colors: treemapColors }
          }],
          layout: {
            ...layout,
            title: chartTitle || 'Treemap Chart'
          }
        };

      // Default to scatter plot for other types
      default:
        // For scatter plots, we'll create a trace for each column
        if (numericColumns.length >= 2) {
          // If we have at least 2 columns, use the first as X and others as Y
          return {
            data: numericColumns.slice(1).map((col, idx) => ({
              type: 'scatter',
              mode: 'markers',
              x: xValues,
              y: data.map(row => row[col.id]),
              name: col.name,
              marker: {
                color: columnColors[col.id] || getRandomColor(),
                size: 8
              }
            })),
            layout: {
              ...layout,
              title: chartTitle || 'Scatter Plot',
              xaxis: { title: numericColumns[0].name }
            }
          };
        } else {
          // Fallback to simple scatter plot
          return {
            data: [{
              type: 'scatter',
              mode: 'markers',
              x: xValues,
              y: yValues,
              marker: {
                color: numericColumns.length > 0 ?
                  (columnColors[numericColumns[0].id] || getRandomColor()) :
                  'blue',
                size: 8
              }
            }],
            layout: {
              ...layout,
              title: chartTitle || 'Scatter Plot'
            }
          };
        }
    }
  };

  const downloadChart = () => {
    if (is3DChart) {
      // For 3D charts, we need to use a different approach
      if (!document.querySelector('canvas')) return;

      const canvas = document.querySelector('canvas');
      const link = document.createElement('a');
      link.download = `${chartTitle || '3d-chart'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
    else if (chartInstance) {
      // For Chart.js charts
      const link = document.createElement('a');
      link.download = `${chartTitle || 'chart'}.png`;
      link.href = chartRef.current.toDataURL('image/png');
      link.click();
    }
    else if (plotlyData) {
      // For Plotly charts
      const plotlyElement = document.querySelector('.js-plotly-plot');
      if (!plotlyElement) return;

      // Use Plotly's toImage function
      import('plotly.js-dist').then(Plotly => {
        Plotly.toImage(plotlyElement, {format: 'png', width: 800, height: 600})
          .then(dataUrl => {
            const link = document.createElement('a');
            link.download = `${chartTitle || 'chart'}.png`;
            link.href = dataUrl;
            link.click();
          });
      });
    }
  };

  const saveVisualization = () => {
    let imageData = '';

    if (is3DChart) {
      // For 3D charts
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      imageData = canvas.toDataURL('image/png');
    }
    else if (chartInstance) {
      // For Chart.js charts
      imageData = chartRef.current.toDataURL('image/png');
    }
    else if (plotlyData) {
      // For Plotly charts, we'll need to get the image data first
      const plotlyElement = document.querySelector('.js-plotly-plot');
      if (!plotlyElement) return;

      // Use Plotly's toImage function
      import('plotly.js-dist').then(Plotly => {
        Plotly.toImage(plotlyElement, {format: 'png', width: 800, height: 600})
          .then(dataUrl => {
            // Filter column colors to only include selected columns
            const selectedColumnColors = {};
            selectedColumns.forEach(colId => {
              if (columnColors[colId]) {
                selectedColumnColors[colId] = columnColors[colId];
              }
            });

            const chartData = {
              type: chartType,
              title: chartTitle || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
              columns: selectedColumns,
              columnColors: selectedColumnColors,
              timestamp: new Date().toISOString(),
              imageData: dataUrl
            };

            onSave(chartData);
          });
      });

      return; // Early return since we're handling the save in the promise
    }
    else {
      // No chart to save
      return;
    }

    // Filter column colors to only include selected columns
    const selectedColumnColors = {};
    selectedColumns.forEach(colId => {
      if (columnColors[colId]) {
        selectedColumnColors[colId] = columnColors[colId];
      }
    });

    const chartData = {
      type: chartType,
      title: chartTitle || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      columns: selectedColumns,
      columnColors: selectedColumnColors,
      timestamp: new Date().toISOString(),
      imageData
    };

    onSave(chartData);
  };

  // Toggle full screen view
  const toggleFullScreen = () => {
    setShowFullScreen(!showFullScreen);
  };

  // Helper function to generate random colors
  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
  };

  return (
    <div className="bg-white p-4 rounded-md shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Create Visualization</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Category</label>
            <select
              value={chartCategory}
              onChange={(e) => {
                setChartCategory(e.target.value);
                // Reset chart type when category changes
                switch(e.target.value) {
                  case 'simple':
                    setChartType('bar');
                    setIs3DChart(false);
                    break;
                  case 'distributions':
                    setChartType('box');
                    setIs3DChart(false);
                    break;
                  case '3d':
                    setChartType('3d-scatter');
                    setIs3DChart(true);
                    break;
                  case 'maps':
                    setChartType('choropleth');
                    setIs3DChart(false);
                    break;
                  case 'finance':
                    setChartType('candlestick');
                    setIs3DChart(false);
                    break;
                  case 'specialized':
                    setChartType('sunburst');
                    setIs3DChart(false);
                    break;
                  default:
                    setChartType('bar');
                    setIs3DChart(false);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="simple">🟦 Simple</option>
              <option value="distributions">🟩 Distributions</option>
              <option value="3d">🟥 3D</option>
              <option value="maps">🟨 Maps</option>
              <option value="finance">💹 Finance</option>
              <option value="specialized">🔷 Specialized</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => {
                setChartType(e.target.value);
                setIs3DChart(e.target.value.startsWith('3d-'));
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {chartCategory === 'simple' && (
                <>
                  <option value="bar">Bar</option>
                  <option value="line">Line</option>
                  <option value="scatter">Scatter</option>
                  <option value="area">Area</option>
                  <option value="heatmap">Heatmap</option>
                  <option value="table">Table</option>
                  <option value="contour">Contour</option>
                  <option value="pie">Pie</option>
                </>
              )}

              {chartCategory === 'distributions' && (
                <>
                  <option value="box">Box</option>
                  <option value="violin">Violin</option>
                  <option value="histogram">Histogram</option>
                  <option value="histogram2d">2D Histogram</option>
                  <option value="histogram2dcontour">2D Contour Histogram</option>
                </>
              )}

              {chartCategory === '3d' && (
                <>
                  <option value="3d-scatter">3D Scatter</option>
                  <option value="3d-line">3D Line</option>
                  <option value="3d-surface">3D Surface</option>
                  <option value="3d-mesh">3D Mesh</option>
                </>
              )}

              {chartCategory === 'maps' && (
                <>
                  <option value="choropleth">Choropleth</option>
                  <option value="scattergeo">Scatter Geo</option>
                  <option value="choropleth-tile">Choropleth Tile</option>
                  <option value="choropleth-atlas">Choropleth Atlas</option>
                  <option value="density-tile">Density Tile</option>
                </>
              )}

              {chartCategory === 'finance' && (
                <>
                  <option value="candlestick">Candlestick</option>
                  <option value="ohlc">OHLC (Open-High-Low-Close)</option>
                  <option value="waterfall">Waterfall</option>
                  <option value="funnel">Funnel</option>
                  <option value="funnel-area">Funnel Area</option>
                </>
              )}

              {chartCategory === 'specialized' && (
                <>
                  <option value="polar-scatter">Polar Scatter</option>
                  <option value="polar-bar">Polar Bar</option>
                  <option value="ternary-scatter">Ternary Scatter</option>
                  <option value="sunburst">Sunburst</option>
                  <option value="treemap">Treemap</option>
                  <option value="sankey">Sankey</option>
                  <option value="parallel">Parallel Coordinates</option>
                  <option value="carpet">Carpet</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Title</label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              placeholder="Enter chart title"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Columns</label>
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center"
            >
              <span>{selectedColumns.length ? `${selectedColumns.length} columns selected` : 'Select columns'}</span>
              {showColumnSelector ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {showColumnSelector && (
          <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {columns.map(column => (
                <div key={column.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`col-${column.id}`}
                    checked={selectedColumns.includes(column.id)}
                    onChange={() => handleColumnToggle(column.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`col-${column.id}`} className="text-sm flex-1">
                    {column.name} ({column.type})
                  </label>

                  {selectedColumns.includes(column.id) && (
                    <div className="flex items-center ml-2">
                      <input
                        type="color"
                        value={columnColors[column.id] || '#000000'}
                        onChange={(e) => handleColorChange(column.id, e.target.value)}
                        className="w-6 h-6 cursor-pointer"
                        title="Choose color for this column"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedColumns.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Palette size={16} className="mr-1" />
                  Column Colors
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {selectedColumns.map(colId => {
                    const column = columns.find(c => c.id === colId);
                    return column ? (
                      <div key={`color-${colId}`} className="flex items-center">
                        <div
                          className="w-4 h-4 mr-2"
                          style={{ backgroundColor: columnColors[colId] || '#000000' }}
                        ></div>
                        <span className="text-sm">{column.name}</span>
                        <input
                          type="color"
                          value={columnColors[colId] || '#000000'}
                          onChange={(e) => handleColorChange(colId, e.target.value)}
                          className="w-6 h-6 ml-auto cursor-pointer"
                        />
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={generateChart}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={selectedColumns.length === 0}
          >
            Generate Chart
          </button>

          <button
            onClick={saveVisualization}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={!chartInstance && !plotlyData && !is3DChart}
          >
            Save to History
          </button>

          <button
            onClick={downloadChart}
            className="px-4 py-2 border border-gray-300 rounded-md flex items-center hover:bg-gray-50"
            disabled={!chartInstance && !plotlyData && !is3DChart}
          >
            <Download size={16} className="mr-1" />
            Download
          </button>

          <button
            onClick={toggleFullScreen}
            className="px-4 py-2 border border-gray-300 rounded-md flex items-center hover:bg-gray-50"
            disabled={!chartInstance && !plotlyData && !is3DChart}
          >
            <Maximize size={16} className="mr-1" />
            Full Screen
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-md p-4 bg-gray-50 h-80 relative">
        {/* Chart.js visualization */}
        {!is3DChart && !plotlyData && (
          <canvas ref={chartRef}></canvas>
        )}

        {/* Plotly visualization */}
        {!is3DChart && plotlyData && (
          <Plot
            ref={plotlyRef}
            data={plotlyData.data}
            layout={{...plotlyData.layout, autosize: true, width: '100%', height: '100%'}}
            style={{width: '100%', height: '100%'}}
            useResizeHandler={true}
            config={{responsive: true}}
          />
        )}

        {/* Three.js 3D visualization */}
        {is3DChart && (
          <ThreeJSVisualization
            data={data}
            columns={columns}
            selectedColumns={selectedColumns}
            chartType={chartType}
            chartTitle={chartTitle}
            columnColors={columnColors}
          />
        )}
      </div>

      {/* Full Screen View */}
      {showFullScreen && (
        <FullScreenView
          title={chartTitle || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`}
          onClose={() => setShowFullScreen(false)}
        >
          <div className="w-full h-full">
            {/* Chart.js visualization */}
            {!is3DChart && !plotlyData && chartInstance && (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={chartRef.current.toDataURL('image/png')}
                  alt={chartTitle || "Chart"}
                  className="max-w-full max-h-full"
                />
              </div>
            )}

            {/* Plotly visualization */}
            {!is3DChart && plotlyData && (
              <Plot
                data={plotlyData.data}
                layout={{...plotlyData.layout, autosize: true}}
                style={{width: '100%', height: '100%'}}
                useResizeHandler={true}
                config={{responsive: true}}
              />
            )}

            {/* Three.js 3D visualization */}
            {is3DChart && (
              <div className="w-full h-full">
                <ThreeJSVisualization
                  data={data}
                  columns={columns}
                  selectedColumns={selectedColumns}
                  chartType={chartType}
                  chartTitle={chartTitle}
                  columnColors={columnColors}
                />
              </div>
            )}
          </div>
        </FullScreenView>
      )}
    </div>
  );
}
