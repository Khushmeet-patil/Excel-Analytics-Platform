// API URL with fallback and error handling
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to check if the backend server is available
const checkServerAvailability = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_URL}/auth/status`, {
      method: 'GET',
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeoutId);
    return !!response && response.ok;
  } catch (error) {
    console.warn('Backend server check failed:', error.message);
    return false;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    // Validate inputs before making the API call
    if (!email || !password) {
      throw new Error('Please provide email and password');
    }

    // Check if server is available first
    const isServerAvailable = await checkServerAvailability().catch(() => false);
    if (!isServerAvailable) {
      throw new Error('Backend server is not available. Please make sure the server is running.');
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();

      // Store token in localStorage for API calls
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (fetchError) {
      if (fetchError.message.includes('Failed to fetch') ||
          fetchError.message.includes('NetworkError') ||
          fetchError.message.includes('Network request failed')) {
        throw new Error('Cannot connect to the server. Please check your internet connection and make sure the backend server is running.');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    // Clear local storage on successful logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    // Clear local storage even on error to prevent auth issues
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error;
  }
};

// Get headers with auth token
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
