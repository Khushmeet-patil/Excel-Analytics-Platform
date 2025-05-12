import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProjectDashboard from './pages/ProjectDashboard';
import ProjectDetail from './pages/ProjectDetail';
import ExcelEditor from './pages/ExcelEditor';
import NewProject from './pages/NewProject';
import MainLayout from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Protected routes with new dashboard layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProjectDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute>
              <MainLayout>
                <NewProject />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProjectDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/files/:fileId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ExcelEditor />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        {/* Redirect all other routes */}
        <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;