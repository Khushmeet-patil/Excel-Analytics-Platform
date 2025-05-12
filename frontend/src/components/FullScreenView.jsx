import { useState, useEffect } from 'react';
import { X, Maximize, Minimize } from 'lucide-react';

export default function FullScreenView({ children, title, onClose }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Handle ESC key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullScreen) {
          toggleFullScreen();
        } else {
          onClose();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen, onClose]);
  
  // Toggle full screen
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center`}>
      <div 
        className={`bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 ${
          isFullScreen ? 'w-full h-full rounded-none' : 'w-11/12 h-5/6 max-w-6xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullScreen}
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
            >
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 h-[calc(100%-4rem)] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
