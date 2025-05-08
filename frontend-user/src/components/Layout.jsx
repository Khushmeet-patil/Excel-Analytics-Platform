import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const location = useLocation();
  const isAnalysisPage = location.pathname.includes('/analysis');

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 px-6 py-8`}>
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;


