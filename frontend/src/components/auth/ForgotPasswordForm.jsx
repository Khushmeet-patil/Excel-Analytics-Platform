import { useState } from 'react';
import { forgotPassword } from '../../services/auth';
import { theme } from '../../theme';

export default function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Changed from resetPassword to forgotPassword
      const result = await forgotPassword(email);
      if (result.success) {
        setMessage('Password reset link has been sent to your email');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium" style={{ color: '#333333' }}>Reset Password</h3>
      <p className="text-sm" style={{ color: '#666666' }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: '#333333' }} htmlFor="email">
            Email
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
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border rounded-md transition-colors"
            style={{
              borderColor: '#E0E0E0',
              color: '#666666',
              ':hover': { backgroundColor: '#F0F0F0' }
            }}
          >
            Back to Login
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
            style={{
              backgroundColor: theme.colors.secondary.main,
              color: theme.colors.secondary.contrastText,
              ':hover': { backgroundColor: theme.colors.secondary.light }
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </div>
      </form>
    </div>
  );
}