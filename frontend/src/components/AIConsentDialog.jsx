import { useState, useEffect } from 'react';
import { getAIConsent, updateAIConsent } from '../services/aiService';
import { AlertCircle, Check, X } from 'lucide-react';

export default function AIConsentDialog({ onConsentChange, onClose }) {
  const [consent, setConsent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConsent = async () => {
      try {
        setIsLoading(true);
        const consentData = await getAIConsent();
        setConsent(consentData.consented);
        setIsLoading(false);
      } catch (error) {
        setError('Failed to fetch consent status');
        setIsLoading(false);
      }
    };

    fetchConsent();
  }, []);

  const handleConsentChange = async (consented) => {
    try {
      setIsLoading(true);
      await updateAIConsent(consented);
      setConsent(consented);
      if (onConsentChange) {
        onConsentChange(consented);
      }
      setIsLoading(false);
    } catch (error) {
      setError('Failed to update consent status');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">AI Data Sharing Consent</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4 flex items-start">
            <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="mb-4">
                To provide AI-powered insights and chat functionality, we need your permission to share your data with our AI service provider (Groq).
              </p>
              <p className="mb-4">
                This includes:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Your project information (name, description)</li>
                <li>Your uploaded file data</li>
                <li>Your chat messages with the AI</li>
              </ul>
              <p className="mb-4">
                Your data will only be used to provide you with AI insights and responses. You can withdraw your consent at any time.
              </p>
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Without your consent, AI features will be disabled.
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => handleConsentChange(false)}
                className={`px-4 py-2 rounded-md ${
                  consent === false
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={isLoading}
              >
                <span className="flex items-center">
                  {consent === false && <X size={16} className="mr-1" />}
                  Decline
                </span>
              </button>
              <button
                onClick={() => handleConsentChange(true)}
                className={`px-4 py-2 rounded-md ${
                  consent === true
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={isLoading}
              >
                <span className="flex items-center">
                  {consent === true && <Check size={16} className="mr-1" />}
                  I Consent
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
