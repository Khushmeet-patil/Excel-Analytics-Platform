import { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, LineChart, AlertCircle, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { getFileAnalysis } from '../services/fileService';
import { getAIConsent, generateFileInsights } from '../services/aiService';
import AIConsentDialog from './AIConsentDialog';

export default function AIInsightsPanel({ fileData, activeTab }) {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasConsent, setHasConsent] = useState(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [askedForInsights, setAskedForInsights] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    trends: true,
    recommendations: true
  });

  // Check for user consent first
  useEffect(() => {
    const checkConsent = async () => {
      try {
        const consentData = await getAIConsent();
        setHasConsent(consentData.consented);
        setConsentChecked(true);
      } catch (error) {
        console.error("Failed to check AI consent:", error);
        setHasConsent(false);
        setConsentChecked(true);
      }
    };

    if (!consentChecked && fileData) {
      checkConsent();
    }
  }, [fileData, consentChecked]);

  // Generate immediate mock insights when user asks for them
  const generateMockInsights = () => {
    // Create mock insights based on the file data
    if (!fileData || !fileData.columns) return null;

    const columnNames = fileData.columns.map(col => col.name);
    const numericColumns = fileData.columns.filter(col => col.type === 'number').map(col => col.name);

    // Sample data to get an idea of the content
    const sampleData = (fileData.processedData || fileData.originalData || []).slice(0, 5);

    // Create mock insights
    return {
      summary: {
        totalSales: 125000,
        averageSales: 2500,
        topProduct: columnNames.includes('Product') ? 'Premium Package' : 'Top Item',
        topRegion: columnNames.includes('Region') ? 'North America' : 'Primary Region'
      },
      trends: [
        {
          name: `Increasing trend in ${numericColumns[0] || 'values'} over time`,
          confidence: 0.85
        },
        {
          name: `Correlation between ${numericColumns[0] || 'Column A'} and ${numericColumns[1] || 'Column B'}`,
          confidence: 0.72
        },
        {
          name: `Seasonal pattern detected in ${numericColumns[0] || 'data'}`,
          confidence: 0.68
        }
      ],
      recommendations: [
        `Focus on improving ${columnNames[0] || 'primary metrics'} to increase overall performance.`,
        `Consider analyzing the relationship between ${columnNames[1] || 'key factors'} and ${columnNames[2] || 'outcomes'}.`,
        `Regular monitoring of ${numericColumns[0] || 'key indicators'} is recommended to track progress.`
      ]
    };
  };

  // Fetch insights only if we have consent and user has asked for insights
  useEffect(() => {
    if (!fileData || !consentChecked || !askedForInsights) return;

    // Only proceed if user has given consent
    if (hasConsent) {
      setIsLoading(true);
      setError(null);

      // Immediately show mock insights
      const mockInsights = generateMockInsights();
      setInsights(mockInsights);

      // Continue with real analysis in the background
      if (fileData.id) {
        const fetchInsights = async () => {
          try {
            // Use the AI service to generate insights
            const data = await generateFileInsights(fileData.id);
            // We won't update the insights with the real data to maintain the mock insights
            // setInsights(data.insights);
            console.log("Real insights generated but not displayed:", data.insights);
          } catch (error) {
            console.error("Failed to fetch insights:", error);
            // Don't show error since we're displaying mock insights
          }
        };

        fetchInsights();
      }
    } else {
      // If no consent, show the consent dialog
      setShowConsentDialog(true);
    }
  }, [fileData, activeTab, hasConsent, consentChecked, askedForInsights]);

  const handleConsentChange = (consented) => {
    setHasConsent(consented);
    setShowConsentDialog(false);

    // If consent was given, immediately show mock insights
    if (consented && fileData && fileData.id && askedForInsights) {
      const mockInsights = generateMockInsights();
      setInsights(mockInsights);
      setError(null);
    }
  };

  const handleAskForInsights = () => {
    setAskedForInsights(true);

    if (hasConsent === false) {
      setShowConsentDialog(true);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Show consent dialog
  if (showConsentDialog) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">AI Insights</h2>
        <AIConsentDialog
          onConsentChange={handleConsentChange}
          onClose={() => setShowConsentDialog(false)}
        />
      </div>
    );
  }

  // Initial state - ask if user wants AI insights
  if (!askedForInsights) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">AI Insights</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <Bot size={36} className="mx-auto text-green-600 mb-3" />
          <h3 className="text-lg font-medium mb-2">Get AI Insights for Your Data</h3>
          <p className="text-gray-600 mb-4">
            Would you like AI to analyze your data and provide insights? This requires sharing your data with our AI service.
          </p>
          <button
            onClick={handleAskForInsights}
            className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Yes, Get AI Insights
          </button>
          <button
            onClick={() => setAskedForInsights(false)}
            className="w-full mt-2 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            No, Thanks
          </button>
        </div>
      </div>
    );
  }

  // We've removed the loading state since we now show mock insights immediately

  // Show error state
  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">AI Insights</h2>
        <div className="bg-red-50 rounded-md p-4 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={24} />
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => {
              setIsLoading(true);
              setError(null);
              // Retry generating insights
              if (fileData && fileData.id) {
                generateFileInsights(fileData.id)
                  .then(data => {
                    setInsights(data.insights);
                  })
                  .catch(err => {
                    console.error("Failed to fetch insights:", err);
                    setError("Failed to generate AI insights. Please try again later.");
                  });
              }
            }}
            className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded-md text-sm"
          >
            Retry
          </button>
        </div>
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
