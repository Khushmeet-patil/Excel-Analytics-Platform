import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Users, Settings, Shield, LogOut, BarChart3 } from 'lucide-react';
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

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Admin Dashboard';
      case '/users':
        return 'User Management';
      case '/analytics':
        return 'Analytics';
      case '/settings':
        return 'System Settings';
      case '/security':
        return 'Security Controls';
      default:
        return 'Admin Panel';
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/users', icon: <Users size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    { name: 'Security', path: '/security', icon: <Shield size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } shadow-lg transition-all duration-300 z-10 h-screen fixed left-0 top-0`}
        style={{ backgroundColor: theme.colors.primary.main }}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b" style={{ borderColor: theme.colors.divider }}>
          {sidebarOpen ? (
            <h1 className="text-xl font-semibold" style={{ color: theme.colors.secondary.main }}>Admin Panel</h1>
          ) : (
            <span className="text-xl font-bold mx-auto" style={{ color: theme.colors.secondary.main }}>AP</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md focus:outline-none"
            style={{ color: theme.colors.text.primary }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-md transition-colors ${
                    isActive(item.path) ? 'bg-opacity-10' : 'hover:bg-opacity-5'
                  }`}
                  style={{
                    backgroundColor: isActive(item.path) ? theme.colors.secondary.main : 'transparent',
                    color: isActive(item.path) ? theme.colors.secondary.main : theme.colors.text.primary,
                  }}
                >
                  <span className="mr-3">{item.icon}</span>
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t" style={{ borderColor: theme.colors.divider }}>
          <button
            onClick={handleLogout}
            className={`flex items-center p-3 rounded-md w-full transition-colors hover:bg-opacity-5`}
            style={{
              color: theme.colors.error.main,
            }}
          >
            <span className="mr-3"><LogOut size={20} /></span>
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
        <header className="shadow-sm h-16 flex items-center px-6" style={{ backgroundColor: theme.colors.primary.main }}>
          <div className="flex items-center">
            <span className="font-medium" style={{ color: theme.colors.text.primary }}>
              {getPageTitle()}
            </span>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: theme.colors.secondary.main }}>
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
