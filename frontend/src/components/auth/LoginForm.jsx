import { useState } from 'react';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

export default function LoginForm({ onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate inputs
    if (!email || !password) {
      setError('Please provide both email and password');
      setLoading(false);
      return;
    }

    try {
      // Try to login with the authService directly first
      try {
        const result = await loginUser(email, password);
        if (result && result.token) {
          // If successful, we don't need to do anything else as the service
          // already stores the token and user in localStorage
          window.location.href = '/dashboard'; // Redirect to dashboard
        }
      } catch (serviceError) {
        // If the service approach fails with a connection error, show a helpful message
        if (serviceError.message.includes('connect to the server') ||
            serviceError.message.includes('Backend server is not available')) {
          setError('Cannot connect to the server. Please make sure the backend server is running at http://localhost:5000');
          console.error('Connection error:', serviceError);
          return;
        }

        // If it's another type of error, try the context login as fallback
        try {
          await login(email, password);
        } catch (authError) {
          // Both approaches failed, show the error
          setError(authError.message || 'Invalid credentials. Please try again.');
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <div className="flex items-start">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
            </div>
            <div>
              <p className="text-sm">{error}</p>
              {error.includes('backend server') && (
                <p className="text-xs mt-1">
                  Please run the backend server using <code className="bg-red-200 px-1 rounded">npm start</code> in the BACKEND directory.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter your email"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter your password"
          required
        />
      </div>
      <button
        type="button"
        onClick={onForgotPassword}
        className="text-sm text-green-600 hover:underline"
        style={{ color: theme.colors.primary.main }}
      >
        Forgot password?
      </button>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        style={{ backgroundColor: theme.colors.primary.main, borderColor: theme.colors.primary.dark }}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
