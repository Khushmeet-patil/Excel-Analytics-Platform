import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react';
import Layout from './components/Layout';

// Lazy load components for better performance
const LandingPage = lazy(() => import('./components/LandingPage'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Projects = lazy(() => import('./components/Projects'));
const NewProject = lazy(() => import('./components/NewProject'));
const Analysis = lazy(() => import('./components/Analysis'));
const Upload = lazy(() => import('./components/Upload'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));

// Loading component
const Loading = () => (
  <div className="h-screen w-full flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

// Add this new component to redirect authenticated users away from landing page
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" /> : children;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for token on initial load
  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } 
          />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/projects"
              element={<ProtectedRoute><Projects /></ProtectedRoute>}
            />
            <Route
              path="/projects/new"
              element={<ProtectedRoute><NewProject /></ProtectedRoute>}
            />
            <Route
              path="/projects/:projectId/upload"
              element={<ProtectedRoute><Upload /></ProtectedRoute>}
            />
            <Route
              path="/projects/:projectId/analysis"
              element={<ProtectedRoute><Analysis /></ProtectedRoute>}
            />
            <Route
              path="/upload"
              element={<ProtectedRoute><Upload /></ProtectedRoute>}
            />
            <Route
              path="/visualize/:fileId"
              element={<ProtectedRoute><Analysis /></ProtectedRoute>}
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;