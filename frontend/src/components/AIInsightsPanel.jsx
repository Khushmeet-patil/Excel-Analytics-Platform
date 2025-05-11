import { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, LineChart, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getFileAnalysis } from '../services/fileService';

export default function AIInsightsPanel({ fileData, activeTab }) {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    trends: true,
    recommendations: true
  });

  useEffect(() => {
    // In a real app, we would fetch insights based on the active tab
    // For now, we'll use the mock data from fileData
    setIsLoading(true);

    if (fileData && fileData.insights) {
      setInsights(fileData.insights);
      setIsLoading(false);
    } else if (fileData && fileData.id) {
      // Simulate fetching insights if not included in fileData
      const fetchInsights = async () => {
        try {
          const data = await getFileAnalysis(fileData.id);
          setInsights(data);
        } catch (error) {
          console.error("Failed to fetch insights:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchInsights();
    }
  }, [fileData, activeTab]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">AI Insights</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
        <p className="text-center text-sm text-gray-500">Analyzing your data...</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">AI Insights</h2>
        <div className="bg-gray-50 rounded-md p-4 text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-2" size={24} />
          <p className="text-gray-600">No insights available for this data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4">AI Insights</h2>

      {/* Data Summary Section */}
      <div className="mb-4 border border-gray-200 rounded-md overflow-hidden">
        <div
          className="flex justify-between items-center p-3 bg-white cursor-pointer"
          onClick={() => toggleSection('summary')}
        >
          <div className="flex items-center">
            <Lightbulb size={18} className="text-green-600 mr-2" />
            <h3 className="font-medium">Data Summary</h3>
          </div>
          {expandedSections.summary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {expandedSections.summary && (
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <p className="text-sm text-gray-500">Total Sales</p>
                <p className="text-lg font-semibold">${insights.summary.totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <p className="text-sm text-gray-500">Average Sales</p>
                <p className="text-lg font-semibold">${insights.summary.averageSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <p className="text-sm text-gray-500">Top Product</p>
                <p className="text-lg font-semibold">{insights.summary.topProduct}</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <p className="text-sm text-gray-500">Top Region</p>
                <p className="text-lg font-semibold">{insights.summary.topRegion}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trends Section */}
      <div className="mb-4 border border-gray-200 rounded-md overflow-hidden">
        <div
          className="flex justify-between items-center p-3 bg-white cursor-pointer"
          onClick={() => toggleSection('trends')}
        >
          <div className="flex items-center">
            <TrendingUp size={18} className="text-blue-600 mr-2" />
            <h3 className="font-medium">Detected Trends</h3>
          </div>
          {expandedSections.trends ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {expandedSections.trends && (
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <ul className="space-y-2">
              {insights.trends.map((trend, index) => (
                <li key={index} className="bg-white p-3 rounded-md border border-gray-200">
                  <div className="flex justify-between items-center">
                    <p>{trend.name}</p>
                    <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {Math.round(trend.confidence * 100)}% confidence
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      <div className="mb-4 border border-gray-200 rounded-md overflow-hidden">
        <div
          className="flex justify-between items-center p-3 bg-white cursor-pointer"
          onClick={() => toggleSection('recommendations')}
        >
          <div className="flex items-center">
            <LineChart size={18} className="text-purple-600 mr-2" />
            <h3 className="font-medium">AI Recommendations</h3>
          </div>
          {expandedSections.recommendations ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {expandedSections.recommendations && (
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <ul className="space-y-2">
              {insights.recommendations.map((recommendation, index) => (
                <li key={index} className="bg-white p-3 rounded-md border border-gray-200 flex">
                  <span className="mr-2 text-purple-600 font-bold">{index + 1}.</span>
                  <p>{recommendation}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Ask AI Section */}
      <div className="mt-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask AI about your data..."
            className="w-full p-2 pr-10 border border-gray-300 rounded-md"
          />
          <button className="absolute right-2 top-2 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
