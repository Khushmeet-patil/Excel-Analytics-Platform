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
        <div className={`p-3 rounded-full ${color} text-white mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your Excel Analytics dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<FileSpreadsheet size={24} />}
          color="bg-green-600"
        />
        <StatCard
          title="Total Excel Files"
          value={stats.totalFiles}
          icon={<BarChart3 size={24} />}
          color="bg-blue-600"
        />
        <StatCard
          title="Data Points Analyzed"
          value="12,458"
          icon={<TrendingUp size={24} />}
          color="bg-purple-600"
        />
        <StatCard
          title="AI Insights Generated"
          value="36"
          icon={<Users size={24} />}
          color="bg-orange-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-gray-100 mr-4">
                    <Clock size={20} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-gray-500">
                      {activity.type === 'project' ? 'Project updated' : 'File uploaded'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{activity.date}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              to="/projects/new"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 mr-3">
                  <PlusSquare size={18} className="text-green-600" />
                </div>
                <span>Create New Project</span>
              </div>
              <ArrowRight size={16} className="text-gray-400" />
            </Link>
            <Link
              to="/projects"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 mr-3">
                  <FileSpreadsheet size={18} className="text-blue-600" />
                </div>
                <span>View All Projects</span>
              </div>
              <ArrowRight size={16} className="text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">System Status</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Storage Used</span>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">API Requests</span>
                  <span className="text-sm font-medium">68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">AI Credits</span>
                  <span className="text-sm font-medium">23%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
