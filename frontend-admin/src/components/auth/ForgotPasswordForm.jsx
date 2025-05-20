import { useState } from 'react';
import axios from 'axios';
import { theme } from '../../theme';

const API_URL = 'http://localhost:5000/api';

export default function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/auth/forgotpassword`, { email });
      
      if (response.data.success) {
        setMessage('Password reset link has been sent to your email.');
      } else {
        setError(response.data.message || 'Failed to send reset email.');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {message}
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

      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 px-4 rounded-md text-center font-medium"
          style={{
            backgroundColor: theme.colors.secondary.main,
            color: theme.colors.secondary.contrastText,
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        
        <button
          type="button"
          onClick={onBack}
          className="py-2 px-4 rounded-md text-center font-medium border"
          style={{
            borderColor: theme.colors.divider,
            color: theme.colors.text.primary,
            backgroundColor: 'transparent'
          }}
        >
          Back to Login
        </button>
      </div>
    </form>
  );
}
