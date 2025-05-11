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
  background: `linear-gradient(to right, ${theme.colors.primary.dark}, ${theme.colors.primary.main})`,
  color: theme.colors.text.inverse // White text on dark background
}}>
  <div className="container mx-auto px-6 text-center">
    <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
      Transform Your Excel Data with AI
    </h1>
    <p className="text-lg md:text-xl text-secondary-light mb-10 max-w-2xl mx-auto">
      Edit, analyze, and visualize your spreadsheets with advanced AI assistance and stunning 2D/3D visualizations.
    </p>
    <button
  onClick={handleButtonClick}
  className="bg-white font-semibold py-3 px-8 mr-4 rounded-full shadow-lg hover:bg-[#DDEEE7] transition-colors"
  style={{ color: theme.colors.primary.main }}
>
  {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
</button>

    
    {!isAuthenticated && (
      <button 
        onClick={() => setIsAuthModalOpen(true)}
        className="mt-4 md:mt-0 border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-primary-main transition-colors"
      >
        Learn More
      </button>
    )}

    {isAuthModalOpen && (
      <AuthModal onClose={() => setIsAuthModalOpen(false)} defaultTab="register" />
    )}
  </div>
</div>

  );
}
