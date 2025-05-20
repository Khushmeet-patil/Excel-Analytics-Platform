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
        <Link to="/" className="text-xl font-bold" style={{ color: theme.colors.secondary.main }}>
          Excel Analyzer Admin
        </Link>

        {currentUser ? (
          <div className="flex items-center space-x-4">
            <span style={{ color: theme.colors.text.primary }}>Welcome, {currentUser.name}</span>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-md transition-colors"
              style={{
                backgroundColor: theme.colors.secondary.main,
                color: theme.colors.secondary.contrastText
              }}
            >
              Dashboard
            </Link>
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center focus:outline-none"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: theme.colors.secondary.main }}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
                  style={{ borderColor: theme.colors.divider }}
                >
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                      style={{ color: theme.colors.error.main }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 rounded-md transition-colors"
            style={{
              backgroundColor: theme.colors.secondary.main,
              color: theme.colors.secondary.contrastText
            }}
          >
            Admin Login
          </button>
        )}

        {isAuthModalOpen && !currentUser && (
          <AuthModal onClose={() => setIsAuthModalOpen(false)} />
        )}
      </div>
    </nav>
  );
}
