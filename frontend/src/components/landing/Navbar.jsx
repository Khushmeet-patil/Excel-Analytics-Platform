import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import AuthModal from '../auth/AuthModal';
import { theme } from '../../theme';

export default function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="py-4 px-6 shadow-md" style={{ backgroundColor: theme.colors.background.default }}>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold" style={{ color: theme.colors.text.primary }}>
          Excel Analyzer
        </Link>
        
        {currentUser ? (
          <div className="flex items-center space-x-4">
            <span style={{ color: theme.colors.text.primary }}>Welcome, {currentUser.name}</span>
            <Link 
              to="/dashboard" 
              className="px-4 py-2 rounded-md transition-colors"
              style={{ 
                backgroundColor: theme.colors.primary.light,
                color: theme.colors.text.white
              }}
            >
              Dashboard
            </Link>
            <button 
              onClick={handleLogout}
              className="bg-transparent text-red-700 hover:bg-red-700 hover:text-white px-4 py-2 rounded-md border border-red-700 transition-colors"
              style={{ borderColor: theme.colors.text.primary }}
            >
              Logout
            </button>
            
            {/* Profile Icon */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ 
                  backgroundColor: theme.colors.primary.main,
                  color: theme.colors.text.white
                }}
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>
              
              {isProfileMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10"
                  style={{ backgroundColor: theme.colors.background.paper }}
                >
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm hover:bg-opacity-10 transition-colors"
                    style={{ color: theme.colors.text.primary }}
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm hover:bg-opacity-10 transition-colors"
                    style={{ color: theme.colors.text.primary }}
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 transition-colors"
                    style={{ color: theme.colors.error.main }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 rounded-md transition-colors"
            style={{ 
              backgroundColor: theme.colors.primary.main,
              color: theme.colors.white
            }}
          >
            Login
          </button>
        )}
        
        {isAuthModalOpen && !currentUser && (
          <AuthModal onClose={() => setIsAuthModalOpen(false)} />
        )}
      </div>
    </nav>
  );
}
