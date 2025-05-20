import { useState, useEffect } from 'react';
import { getChatHistory, getAIConsent } from '../services/aiService';
import { Bot, FileText, Folder, User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AIConsentDialog from './AIConsentDialog';

export default function ChatHistoryManager() {
  const [chatHistories, setChatHistories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasConsent, setHasConsent] = useState(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [activeHistoryKey, setActiveHistoryKey] = useState('general');

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

    if (!consentChecked) {
      checkConsent();
    }
  }, [consentChecked]);

  // Fetch all chat histories
  useEffect(() => {
    if (hasConsent === true && consentChecked) {
      const fetchAllChatHistories = async () => {
        try {
          setIsLoading(true);
          
          // First get general chat history
          const generalHistory = await getChatHistory();
          
          // Initialize histories object
          const histories = {
            general: {
              name: 'General Chat',
              messages: generalHistory,
              type: 'general'
            }
          };
          
          // Get project-specific histories
          // This would require a new API endpoint to get all projects with chat history
          // For now, we'll just use the general history
          
          setChatHistories(histories);
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to fetch chat histories:", error);
          setError('Failed to load chat histories');
          setIsLoading(false);
        }
      };

      fetchAllChatHistories();
    } else if (hasConsent === false && consentChecked) {
      setIsLoading(false);
    }
  }, [hasConsent, consentChecked]);

  const handleConsentChange = (consented) => {
    setHasConsent(consented);
    setShowConsentDialog(false);
  };

  // If user has explicitly denied consent and we've checked, don't show anything
  if (hasConsent === false && consentChecked) {
    return null;
  }

  // If we're still checking consent, show loading
  if (isLoading || !consentChecked) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-2"></div>
        <p className="text-gray-600">Loading chat histories...</p>
      </div>
    );
  }

  // If there's an error
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-700 p-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Bot className="mr-2 text-green-600" size={20} />
          Chat History
        </h2>
        <p className="text-sm text-gray-500">
          View your conversations with AI
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">RECENT CHATS</h3>
          <ul className="space-y-2">
            {Object.keys(chatHistories).length === 0 ? (
              <li className="text-gray-500 text-sm p-2">No chat history found</li>
            ) : (
              Object.entries(chatHistories).map(([key, history]) => (
                <li key={key}>
                  <Link
                    to={history.type === 'general' ? '/ai/chat' : 
                         history.type === 'project' ? `/ai/chat/project/${history.id}` : 
                         `/ai/chat/project/${history.projectId}/file/${history.id}`}
                    className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${
                      activeHistoryKey === key ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setActiveHistoryKey(key)}
                  >
                    {history.type === 'general' ? (
                      <Bot size={16} className="mr-2 text-green-600" />
                    ) : history.type === 'project' ? (
                      <Folder size={16} className="mr-2 text-blue-600" />
                    ) : (
                      <FileText size={16} className="mr-2 text-purple-600" />
                    )}
                    <span className="flex-1 truncate">{history.name}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Consent dialog */}
      {showConsentDialog && (
        <AIConsentDialog
          onConsentChange={handleConsentChange}
          onClose={() => setShowConsentDialog(false)}
        />
      )}
    </div>
  );
}
