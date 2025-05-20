// services/aiService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Headers with auth token
const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

/**
 * Get user's AI data sharing consent status
 * @returns {Promise<Object>} - User's consent status
 */
export const getAIConsent = async () => {
  try {
    const response = await fetch(`${API_URL}/ai/consent`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching AI consent status:', error);
    throw error;
  }
};

/**
 * Update user's AI data sharing consent
 * @param {boolean} consented - Whether the user consents to AI data sharing
 * @returns {Promise<Object>} - Updated consent status
 */
export const updateAIConsent = async (consented) => {
  try {
    const response = await fetch(`${API_URL}/ai/consent`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ consented }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating AI consent status:', error);
    throw error;
  }
};

/**
 * Send a message to AI and get a response
 * @param {string} message - The message to send to AI
 * @param {string} projectId - Optional project ID for context
 * @param {string} fileId - Optional file ID for context
 * @returns {Promise<Object>} - AI response
 */
export const sendChatMessage = async (message, projectId = null, fileId = null) => {
  try {
    const response = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        message,
        projectId,
        fileId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Get chat history
 * @param {string} projectId - Optional project ID to filter by
 * @param {string} fileId - Optional file ID to filter by
 * @param {number} limit - Maximum number of messages to retrieve
 * @returns {Promise<Array>} - Chat history
 */
export const getChatHistory = async (projectId = null, fileId = null, limit = 50) => {
  try {
    let url = `${API_URL}/ai/chat/history?limit=${limit}`;
    
    if (projectId) {
      url += `&projectId=${projectId}`;
    }
    
    if (fileId) {
      url += `&fileId=${fileId}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

/**
 * Generate AI insights for a file
 * @param {string} fileId - The ID of the file to analyze
 * @returns {Promise<Object>} - Generated insights
 */
export const generateFileInsights = async (fileId) => {
  try {
    const response = await fetch(`${API_URL}/ai/insights/${fileId}`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error generating file insights:', error);
    throw error;
  }
};
