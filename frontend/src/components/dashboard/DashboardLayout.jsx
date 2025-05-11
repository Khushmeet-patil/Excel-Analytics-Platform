import { useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import { theme } from '../../theme';

export default function DashboardLayout({ children }) {
  const location = useLocation();
  
  // Helper function to determine the page title based on the current route
  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname === '/projects') return 'Projects';
    if (location.pathname === '/projects/new') return 'New Project';
    if (location.pathname.includes('/projects/')) return 'Project Details';
    if (location.pathname === '/settings') return 'Settings';
    return 'Excel Analytics';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-20 md:ml-64">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <div className="flex items-center text-gray-600">
            <span className="font-medium">
              {getPageTitle()}
            </span>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                U
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
