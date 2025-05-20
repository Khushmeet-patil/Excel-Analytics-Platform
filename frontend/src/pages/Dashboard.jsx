import { useState, useEffect } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  PlusSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllProjects } from '../services/projectService';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalFiles: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Fetch projects to calculate stats
        const projects = await getAllProjects();

        // Calculate total files
        const totalFiles = projects.reduce((sum, project) => sum + project.fileCount, 0);

        // Create recent activity from projects
        const recentActivity = projects
          .slice(0, 3)
          .map(project => ({
            id: project.id,
            type: 'project',
            name: project.name,
            date: new Date(project.lastModified).toLocaleDateString(),
            time: new Date(project.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));

        setStats({
          totalProjects: projects.length,
          totalFiles,
          recentActivity
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full text-white mr-4`} style={{ backgroundColor: '#0F593E' }}>
          {icon}
        </div>
        <div>
          <p className="text-sm" style={{ color: '#666666' }}>{title}</p>
          <h3 className="text-2xl font-bold" style={{ color: '#333333' }}>{value}</h3>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#0F593E' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#333333' }}>Dashboard</h1>
        <p style={{ color: '#666666' }}>Welcome to your Excel Analytics dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<FileSpreadsheet size={24} />}
        />
        <StatCard
          title="Total Excel Files"
          value={stats.totalFiles}
          icon={<BarChart3 size={24} />}
        />
        <StatCard
          title="Data Points Analyzed"
          value="12,458"
          icon={<TrendingUp size={24} />}
        />
        <StatCard
          title="AI Insights Generated"
          value="36"
          icon={<Users size={24} />}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b" style={{ borderColor: '#E0E0E0' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#333333' }}>Recent Activity</h2>
        </div>
        <div className="divide-y" style={{ borderColor: '#E0E0E0' }}>
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full mr-4" style={{ backgroundColor: '#F0F0F0' }}>
                    <Clock size={20} style={{ color: '#0F593E' }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: '#333333' }}>{activity.name}</p>
                    <p className="text-sm" style={{ color: '#666666' }}>
                      {activity.type === 'project' ? 'Project updated' : 'File uploaded'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm" style={{ color: '#666666' }}>{activity.date}</p>
                    <p className="text-xs" style={{ color: '#999999' }}>{activity.time}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center" style={{ color: '#666666' }}>
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b" style={{ borderColor: '#E0E0E0' }}>
            <h2 className="text-lg font-semibold" style={{ color: '#333333' }}>Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              to="/projects/new"
              className="flex items-center justify-between p-3 rounded-md transition-colors"
              style={{ backgroundColor: '#F9FBFA', ':hover': { backgroundColor: '#F0F0F0' } }}
            >
              <div className="flex items-center">
                <div className="p-2 rounded-full mr-3" style={{ backgroundColor: 'rgba(15, 89, 62, 0.1)' }}>
                  <PlusSquare size={18} style={{ color: '#0F593E' }} />
                </div>
                <span style={{ color: '#333333' }}>Create New Project</span>
              </div>
              <ArrowRight size={16} style={{ color: '#666666' }} />
            </Link>
            <Link
              to="/projects"
              className="flex items-center justify-between p-3 rounded-md transition-colors"
              style={{ backgroundColor: '#F9FBFA', ':hover': { backgroundColor: '#F0F0F0' } }}
            >
              <div className="flex items-center">
                <div className="p-2 rounded-full mr-3" style={{ backgroundColor: 'rgba(15, 89, 62, 0.1)' }}>
                  <FileSpreadsheet size={18} style={{ color: '#0F593E' }} />
                </div>
                <span style={{ color: '#333333' }}>View All Projects</span>
              </div>
              <ArrowRight size={16} style={{ color: '#666666' }} />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b" style={{ borderColor: '#E0E0E0' }}>
            <h2 className="text-lg font-semibold" style={{ color: '#333333' }}>System Status</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm" style={{ color: '#666666' }}>Storage Used</span>
                  <span className="text-sm font-medium" style={{ color: '#333333' }}>45%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F0F0F0' }}>
                  <div className="h-2 rounded-full" style={{ backgroundColor: '#0F593E', width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm" style={{ color: '#666666' }}>API Requests</span>
                  <span className="text-sm font-medium" style={{ color: '#333333' }}>68%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F0F0F0' }}>
                  <div className="h-2 rounded-full" style={{ backgroundColor: '#0F593E', width: '68%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm" style={{ color: '#666666' }}>AI Credits</span>
                  <span className="text-sm font-medium" style={{ color: '#333333' }}>23%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F0F0F0' }}>
                  <div className="h-2 rounded-full" style={{ backgroundColor: '#0F593E', width: '23%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
