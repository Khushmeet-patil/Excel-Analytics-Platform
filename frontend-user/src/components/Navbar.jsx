import { Bell, User, LogOut, Upload } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectName, setProjectName] = useState('');
  const isAnalysisPage = location.pathname.includes('/analysis');
  const projectId = isAnalysisPage ? location.pathname.split('/')[2] : null;

  useEffect(() => {
    if (isAnalysisPage && projectId) {
      // Fetch project name if on analysis page
      const fetchProjectName = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          
          if (response.ok) {
            const data = await response.json();
            setProjectName(data.name || 'Analysis Workspace');
          }
        } catch (err) {
          console.error('Error fetching project:', err);
        }
      };
      
      fetchProjectName();
    }
  }, [isAnalysisPage, projectId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-lg font-semibold text-gray-900">
              {isAnalysisPage ? projectName : 'Excel Analytics'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {isAnalysisPage && (
              <Link
                to={`/projects/${projectId}/upload`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-800 bg-white hover:bg-green-50 transition-colors border-green-600"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Link>
            )}
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <User className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
