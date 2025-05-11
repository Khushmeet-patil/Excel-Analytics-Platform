import Navbar from '../components/landing/Navbar';
import Dashboard from '../components/dashboard/Dashboard';
import { theme } from '../theme';

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.colors.background.default }}>
      <Navbar />
      <Dashboard />
      <footer className="py-6" style={{ backgroundColor: theme.colors.background.paper }}>
        <div className="container mx-auto px-6 text-center" style={{ color: theme.colors.text.secondary }}>
          <p>© {new Date().getFullYear()} Excel Analyzer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}