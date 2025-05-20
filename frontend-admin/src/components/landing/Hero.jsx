import { theme } from '../../theme';
import { useState } from 'react';
import AuthModal from '../auth/AuthModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="py-20" style={{
      background: `linear-gradient(to right, ${theme.colors.secondary.dark}, ${theme.colors.secondary.main})`,
      color: theme.colors.text.inverse // White text on dark background
    }}>
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
          Excel Analytics Admin Panel
        </h1>
        <p className="text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto opacity-90">
          Manage users, projects, and system settings with advanced administrative controls.
        </p>
        <button
          onClick={handleButtonClick}
          className="bg-white font-semibold py-3 px-8 mr-4 rounded-full shadow-lg hover:bg-[#F0F0F0] transition-colors"
          style={{ color: theme.colors.secondary.main }}
        >
          {isAuthenticated ? 'Go to Admin Dashboard' : 'Admin Login'}
        </button>

        {!isAuthenticated && (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="mt-4 md:mt-0 border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-secondary-main transition-colors"
            style={{ borderColor: 'white' }}
          >
            Register Admin
          </button>
        )}

        {isAuthModalOpen && (
          <AuthModal onClose={() => setIsAuthModalOpen(false)} defaultTab="register" />
        )}
      </div>
    </div>
  );
}
