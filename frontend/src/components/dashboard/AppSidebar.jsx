import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  PlusSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

export default function AppSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Projects', path: '/projects', icon: <FileSpreadsheet size={20} /> },
    { name: 'New Project', path: '/projects/new', icon: <PlusSquare size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div 
      className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-white shadow-lg transition-all duration-300 z-10 h-screen fixed left-0 top-0`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {sidebarOpen ? (
          <h1 className="text-xl font-semibold text-green-600">Excel Analytics</h1>
        ) : (
          <span className="text-xl font-bold text-green-600">EA</span>
        )}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-md hover:bg-gray-100"
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
                }`}
              >
                <span className="mr-3">{item.icon}</span>
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
        >
          <LogOut size={20} className={sidebarOpen ? "mr-3" : ""} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
