import { useState } from 'react';
import { Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function VisualizationHistory({ visualizations, onDelete }) {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDownload = (imageData, title) => {
    const link = document.createElement('a');
    link.download = `${title || 'chart'}.png`;
    link.href = imageData;
    link.click();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (!visualizations || visualizations.length === 0) {
    return (
      <div className="bg-white p-4 rounded-md shadow text-center">
        <p className="text-gray-500">No visualizations yet. Create one to see it here!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow">
      <h3 className="text-lg font-semibold p-4 border-b border-gray-200">Visualization History</h3>
      
      <div className="max-h-[600px] overflow-y-auto">
        {/* Sort visualizations by timestamp, newest first */}
        {[...visualizations].sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        ).map((viz, index) => (
          <div 
            key={viz.id || index} 
            className="border-b border-gray-200 last:border-b-0"
          >
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
              onClick={() => toggleExpand(viz.id || index)}
            >
              <div>
                <h4 className="font-medium">{viz.title}</h4>
                <p className="text-sm text-gray-500">
                  {formatDate(viz.timestamp)} • {viz.type.charAt(0).toUpperCase() + viz.type.slice(1)} Chart
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(viz.imageData, viz.title);
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(viz.id || index);
                  }}
                  className="p-1 text-gray-500 hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
                {expandedItems[viz.id || index] ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </div>
            </div>
            
            {expandedItems[viz.id || index] && (
              <div className="p-4 bg-gray-50">
                <div className="flex justify-center">
                  <img 
                    src={viz.imageData} 
                    alt={viz.title} 
                    className="max-w-full max-h-[400px] object-contain"
                  />
                </div>
                {viz.columns && viz.columns.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p>Columns used: {viz.columns.join(', ')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
