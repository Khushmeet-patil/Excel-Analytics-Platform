import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import { theme } from '../theme';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Show welcome popup when user visits for the first time
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited && !isAuthenticated) {
      // Wait a short delay before showing the modal for better UX
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
        localStorage.setItem('hasVisited', 'true');
      }, 1500);

      return () => clearTimeout(timer);
    }

    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.colors.background.default }}>
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
      </main>
      <footer className="py-8" style={{ backgroundColor: theme.colors.background.paper }}>
        <div className="container mx-auto px-6 text-center" style={{ color: theme.colors.text.secondary }}>
          <p>© {new Date().getFullYear()} Excel Analyzer. All rights reserved.</p>
        </div>
      </footer>

      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative" style={{ backgroundColor: theme.colors.background.paper }}>
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="text-4xl mb-4">✨</div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text.primary }}>Welcome to Excel Analyzer</h2>
              <p className="mb-4" style={{ color: theme.colors.text.secondary }}>
                Transform your data analysis with our AI-powered Excel tools
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <div className="mr-3 text-xl">📊</div>
                <p style={{ color: theme.colors.text.primary }}>Powerful 3D visualizations</p>
              </div>
              <div className="flex items-center">
                <div className="mr-3 text-xl">🤖</div>
                <p style={{ color: theme.colors.text.primary }}>AI-powered data analysis</p>
              </div>
              <div className="flex items-center">
                <div className="mr-3 text-xl">🔒</div>
                <p style={{ color: theme.colors.text.primary }}>Secure cloud storage</p>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  setShowWelcomeModal(false);
                }}
                className="w-full py-3 px-4 rounded-md text-center font-medium"
                style={{
                  backgroundColor: theme.colors.primary.main,
                  color: theme.colors.text.primary
                }}
              >
                Create Account
              </button>
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full py-3 px-4 rounded-md text-center font-medium"
                style={{
                  backgroundColor: 'transparent',
                  borderWidth: '1px',
                  borderColor: theme.colors.primary.light,
                  color: theme.colors.text.primary
                }}
              >
                Explore Features
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}