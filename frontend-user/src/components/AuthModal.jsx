import { useState } from 'react';
import { X } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, onAuth, message }) => {
  const [authMode, setAuthMode] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [signupErrors, setSignupErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateSignup = () => {
    const errors = {};
    if (!signupData.name.trim()) errors.name = 'Name is required';
    if (!signupData.email.includes('@') || !signupData.email.includes('.')) errors.email = 'Please enter a valid email';
    if (signupData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    return errors;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      
      if (response.ok) {
        // Store additional user info if needed
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        onAuth(data, true);
      } else {
        onAuth({ msg: data.msg || 'Login failed. Please check your credentials.', type: 'error' }, false);
      }
    } catch (error) {
      onAuth({ msg: 'An error occurred during login. Please try again.', type: 'error' }, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const errors = validateSignup();
    setSignupErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const data = await response.json();
      
      if (response.ok) {
        onAuth(data, false);
      } else {
        const errorMsg = data.errors
          ? data.errors.map((err) => err.msg).join(', ')
          : data.msg || 'Failed to register. Please check your input.';
        onAuth({ msg: errorMsg, type: 'error' }, false);
      }
    } catch (error) {
      onAuth({ msg: 'An error occurred during registration. Please try again.', type: 'error' }, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.includes('@') || !forgotEmail.includes('.')) {
      onAuth({ msg: 'Please enter a valid email', type: 'error' }, false);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      onAuth({ msg: data.msg, type: response.ok ? 'success' : 'error' }, false);
      
      if (response.ok) {
        setForgotEmail('');
        setAuthMode('login');
      }
    } catch (error) {
      onAuth({ msg: 'An error occurred. Please try again.', type: 'error' }, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAuthTabs = () => (
    <div className="flex space-x-4 mb-8">
      <button
        onClick={() => setAuthMode('login')}
        className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 ${
          authMode === 'login'
            ? 'btn-primary shadow'
            : 'btn-secondary bg-gray-100 border border-gray-200 shadow-none'
        }`}
      >
        Login
      </button>
      <button
        onClick={() => setAuthMode('signup')}
        className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 ${
          authMode === 'signup'
            ? 'btn-primary shadow'
            : 'btn-secondary bg-gray-100 border border-gray-200 shadow-none'
        }`}
      >
        Sign Up
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
          disabled={isSubmitting}
        >
          <X className="h-6 w-6" />
        </button>

        {message.text && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {authMode === 'login' && (
          <>
            {renderAuthTabs()}
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="input-field"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-sm text-green-600 hover:text-green-800"
                    disabled={isSubmitting}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="input-field"
                  disabled={isSubmitting}
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </>
        )}

        {authMode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-5">
            {renderAuthTabs()}
            <div className="space-y-2">
              <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="John Doe"
                required
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                className="input-field"
                disabled={isSubmitting}
              />
              {signupErrors.name && <p className="text-red-500 text-sm">{signupErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                required
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                className="input-field"
                disabled={isSubmitting}
              />
              {signupErrors.email && <p className="text-red-500 text-sm">{signupErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="signup-password"
                type="password"
                required
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                className="input-field"
                disabled={isSubmitting}
              />
              {signupErrors.password && <p className="text-red-500 text-sm">{signupErrors.password}</p>}
            </div>
            <button 
              type="submit" 
              className="btn-primary w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <h2 className="text-xl font-bold text-gray-900">Forgot Password</h2>
            <p className="text-sm text-gray-600">Enter your email to receive a password reset link.</p>
            <div className="space-y-2">
              <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="input-field"
                disabled={isSubmitting}
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className="btn-secondary w-full mt-2"
              disabled={isSubmitting}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;