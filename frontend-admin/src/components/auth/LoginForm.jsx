import { useState } from 'react';
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

    try {
      await login(email, password);
      // Redirect will be handled by the AuthContext
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
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
        <label className="block text-sm font-bold mb-2" style={{ color: '#333333' }} htmlFor="email">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{
            borderColor: '#E0E0E0',
            ':focus': { borderColor: theme.colors.secondary.main, boxShadow: `0 0 0 2px ${theme.colors.secondary.main}20` }
          }}
          required
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-bold" style={{ color: '#333333' }} htmlFor="password">
            Password
          </label>
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm"
              style={{ color: theme.colors.secondary.main }}
            >
              Forgot Password?
            </button>
          )}
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{
            borderColor: '#E0E0E0',
            ':focus': { borderColor: theme.colors.secondary.main, boxShadow: `0 0 0 2px ${theme.colors.secondary.main}20` }
          }}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 rounded-md text-center font-medium mt-4"
        style={{
          backgroundColor: theme.colors.secondary.main,
          color: theme.colors.secondary.contrastText,
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
