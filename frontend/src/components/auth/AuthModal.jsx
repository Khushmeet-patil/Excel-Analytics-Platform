import { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { theme } from '../../theme';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ onClose, defaultTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
      onClose();
    }
  }, [isAuthenticated, navigate, onClose]);

  // Close modal when ESC key is pressed
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 hover:text-gray-700"
          style={{ color: '#666666' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex border-b mb-6" style={{ borderColor: '#E0E0E0' }}>
          <button
            className={`py-2 px-4 ${activeTab === 'login' ? 'border-b-2' : ''}`}
            onClick={() => setActiveTab('login')}
            style={{
              color: activeTab === 'login' ? theme.colors.secondary.main : '#666666',
              borderColor: activeTab === 'login' ? theme.colors.secondary.main : 'transparent'
            }}
          >
            Login
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'register' ? 'border-b-2' : ''}`}
            onClick={() => setActiveTab('register')}
            style={{
              color: activeTab === 'register' ? theme.colors.secondary.main : '#666666',
              borderColor: activeTab === 'register' ? theme.colors.secondary.main : 'transparent'
            }}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' && <LoginForm onForgotPassword={() => setActiveTab('forgot')} />}
        {activeTab === 'register' && <RegisterForm onSuccess={() => setActiveTab('login')} />}
        {activeTab === 'forgot' && <ForgotPasswordForm onBack={() => setActiveTab('login')} />}
      </div>
    </div>
  );
}