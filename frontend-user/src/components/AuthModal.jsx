import { useState } from 'react';
import { X } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, onAuth }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    onAuth(loginData, true);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    onAuth(signupData, false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
          <X className="h-6 w-6" />
        </button>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'login'
                ? 'btn-primary shadow'
                : 'btn-secondary bg-gray-100 border border-gray-200 shadow-none'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'signup'
                ? 'btn-primary shadow'
                : 'btn-secondary bg-gray-100 border border-gray-200 shadow-none'
            }`}
          >
            Sign Up
          </button>
        </div>

        {activeTab === 'login' && (
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
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-sm text-green-600 hover:text-green-800">
                  Forgot password?
                </a>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-2">
              Login
            </button>
          </form>
        )}

        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-5">
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
              />
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
              />
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
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-green-600 hover:text-green-800">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-green-600 hover:text-green-800">
                  Privacy Policy
                </a>
              </label>
            </div>
            <button type="submit" className="btn-primary w-full mt-2">
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;