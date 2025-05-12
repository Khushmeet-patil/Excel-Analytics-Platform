import { useState } from 'react';
import { resetPasswordWithToken } from '../../services/auth';
import { theme } from '../../theme';
import { useNavigate } from 'react-router-dom';

export default function ResetPasswordForm({ token }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await resetPasswordWithToken(token, password);
      if (result.success) {
        setMessage('Password has been reset successfully');
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-medium mb-4" style={{ color: '#333333' }}>Reset Your Password</h3>
      <p className="text-sm mb-6" style={{ color: '#666666' }}>
        Please enter your new password below.
      </p>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: '#333333' }} htmlFor="password">
            New Password
          </label>
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
            placeholder="Enter your new password"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: '#333333' }} htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={{
              borderColor: '#E0E0E0',
              ':focus': { borderColor: theme.colors.secondary.main, boxShadow: `0 0 0 2px ${theme.colors.secondary.main}20` }
            }}
            placeholder="Confirm your new password"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
          style={{
            backgroundColor: theme.colors.secondary.main,
            color: theme.colors.secondary.contrastText,
            ':hover': { backgroundColor: theme.colors.secondary.light }
          }}
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
