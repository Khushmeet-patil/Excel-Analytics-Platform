import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, FileSpreadsheet, PlusSquare, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Projects', path: '/projects', icon: <FileSpreadsheet size={20} /> },
    { name: 'New Project', path: '/projects/new', icon: <PlusSquare size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper function to determine the page title based on the current route
  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return 'Dashboard';
    if (location.pathname === '/projects') return 'Projects';
    if (location.pathname === '/projects/new') return 'New Project';
    if (location.pathname.includes('/projects/')) return 'Project Details';
    return 'Excel Analytics';
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 z-10 h-screen fixed left-0 top-0`}
        style={{ backgroundColor: theme.colors.background.paper }}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <h1 className="text-xl font-semibold" style={{ color: theme.colors.secondary.main }}>Excel Analytics</h1>
          ) : (
            <span className="text-xl font-bold mx-auto" style={{ color: theme.colors.secondary.main }}>EA</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md hover:bg-gray-100"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-6">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  } ${!sidebarOpen ? 'justify-center' : ''}`}
                  style={isActive(item.path)
                    ? { backgroundColor: `${theme.colors.secondary.light}20`, color: theme.colors.secondary.main }
                    : { color: 'gray' }}
                  title={!sidebarOpen ? item.name : ""}
                >
                  <span className={sidebarOpen ? "mr-3" : ""}>{item.icon}</span>
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            className={`flex items-center p-3 rounded-md text-gray-600 hover:bg-gray-50 w-full ${
              sidebarOpen ? '' : 'justify-center'
            }`}
            onClick={handleLogout}
            title={!sidebarOpen ? "Logout" : ""}
          >
            <LogOut size={20} className={sidebarOpen ? "mr-3" : ""} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
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
