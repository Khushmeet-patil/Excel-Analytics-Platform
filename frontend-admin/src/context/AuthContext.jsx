import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if user is already logged in from localStorage
        const user = localStorage.getItem('admin-user');
        const token = localStorage.getItem('admin-token');

        if (user && token) {
          try {
            // Set axios default headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Verify the token is still valid by getting the current user
            const response = await axios.get(`${API_URL}/auth/me`);
            
            if (response.data.success && response.data.data) {
              const userData = response.data.data;
              // Only set as authenticated if user is an admin
              if (userData.role === 'admin') {
                setCurrentUser(userData);
              } else {
                // If not admin, clear localStorage
                localStorage.removeItem('admin-user');
                localStorage.removeItem('admin-token');
              }
            } else {
              // If token is invalid, clear localStorage
              localStorage.removeItem('admin-user');
              localStorage.removeItem('admin-token');
            }
          } catch (error) {
            console.error('Error verifying user:', error);
            localStorage.removeItem('admin-user');
            localStorage.removeItem('admin-token');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      // Validate inputs before making the API call
      if (!email || !password) {
        throw new Error('Please provide email and password');
      }

      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      
      const data = response.data;
      
      // Check if user is an admin
      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Set axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setCurrentUser(data.user);
      localStorage.setItem('admin-user', JSON.stringify(data.user));
      localStorage.setItem('admin-token', data.token);
      return data.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Remove axios default headers
      delete axios.defaults.headers.common['Authorization'];
      
      setCurrentUser(null);
      localStorage.removeItem('admin-user');
      localStorage.removeItem('admin-token');
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser, // Only authenticated if user exists
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
