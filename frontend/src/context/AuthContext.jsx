import { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, loginUser, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if user is already logged in from localStorage
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (user && token) {
          try {
            // Verify the token is still valid by getting the current user
            const userData = await getCurrentUser();
            if (userData) {
              setCurrentUser(userData);
            } else {
              // If token is invalid, clear localStorage
              localStorage.removeItem('user');
              localStorage.removeItem('token');
            }
          } catch (error) {
            console.error('Error verifying user:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
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

      const data = await loginUser(email, password);

      // Check if we have the expected data structure
      if (!data || !data.user) {
        throw new Error('Invalid response from server');
      }

      setCurrentUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      return data.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const value = {
    currentUser,
    login,
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