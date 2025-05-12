import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getChatHistory } from '../services/aiService';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import AIConsentDialog from './AIConsentDialog';

export default function AIChat({ projectId = null, fileId = null, fileData = null }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [hasConsent, setHasConsent] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch chat history on component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        const history = await getChatHistory(projectId, fileId);
        setMessages(history);
        setIsLoading(false);
      } catch (error) {
        if (error.message.includes('not consented')) {
          setHasConsent(false);
        } else {
          setError('Failed to load chat history');
        }
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [projectId, fileId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add user message to the chat
      const userMessage = {
        role: 'user',
        content: inputMessage,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');

      // Send message to AI
      const response = await sendChatMessage(inputMessage, projectId, fileId);

      // Add AI response to the chat
      const aiMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: response.timestamp
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    } catch (error) {
      if (error.message.includes('not consented')) {
        setHasConsent(false);
        setShowConsentDialog(true);
      } else {
        setError('Failed to send message. Please try again.');
      }
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConsentChange = (consented) => {
    setHasConsent(consented);
    setShowConsentDialog(false);
  };

  // Format timestamp to readable format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Bot className="mr-2 text-green-600" size={20} />
          AI Assistant
        </h2>
        <p className="text-sm text-gray-500">
          Ask questions about your data and get AI-powered insights
        </p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && !isLoading && !error ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot size={40} className="mb-2 text-gray-400" />
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.role === 'assistant' ? (
                    <Bot size={16} className="mr-1 text-green-600" />
                  ) : (
                    <User size={16} className="mr-1" />
                  )}
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <p className={message.role === 'user' ? 'text-white' : 'text-gray-800'}>
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-white border border-gray-200">
              <div className="flex items-center">
                <Loader2 size={16} className="mr-2 animate-spin text-green-600" />
                <span className="text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 p-4">
        {hasConsent === false ? (
          <div className="bg-yellow-50 p-3 rounded-md mb-4 text-sm">
            <p className="font-medium">AI features require your consent</p>
            <p className="mt-1">
              To use AI chat, you need to consent to data sharing.
            </p>
            <button
              onClick={() => setShowConsentDialog(true)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Manage Consent
            </button>
          </div>
        ) : (
          <div className="relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full p-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="absolute right-3 bottom-3 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <Send size={20} />
            </button>
          </div>
        )}
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
