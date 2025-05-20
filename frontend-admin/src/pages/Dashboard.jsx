import { theme } from '../theme';
import { Users, FileSpreadsheet, BarChart3, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { currentUser } = useAuth();

  const stats = [
    {
      title: 'Total Users',
      value: '245',
      icon: <Users size={24} />,
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Active Projects',
      value: '64',
      icon: <FileSpreadsheet size={24} />,
      change: '+5%',
      changeType: 'positive',
    },
    {
      title: 'Data Processed',
      value: '1.2 TB',
      icon: <BarChart3 size={24} />,
      change: '+18%',
      changeType: 'positive',
    },
    {
      title: 'System Health',
      value: '98%',
      icon: <Activity size={24} />,
      change: '-2%',
      changeType: 'negative',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
          Welcome back, {currentUser?.name || 'Admin'}
        </h2>
        <p style={{ color: theme.colors.text.primary }}>
          Here's an overview of your Excel Analytics platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.colors.text.secondary }}>
                  {stat.title}
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.colors.text.primary }}>
                  {stat.value}
                </p>
              </div>
              <div 
                className="p-2 rounded-full"
                style={{ backgroundColor: `${theme.colors.secondary.main}15`, color: theme.colors.secondary.main }}
              >
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <span 
                className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm ml-1" style={{ color: theme.colors.text.secondary }}>
                since last month
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            Recent User Activity
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center py-2 border-b" style={{ borderColor: theme.colors.divider }}>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white"
                  style={{ backgroundColor: theme.colors.secondary.main }}
                >
                  U
                </div>
                <div>
                  <p className="font-medium" style={{ color: theme.colors.text.primary }}>
                    User {item}
                  </p>
                  <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                    Created a new project • {item} hour{item !== 1 ? 's' : ''} ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            System Notifications
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="py-2 border-b" style={{ borderColor: theme.colors.divider }}>
                <div className="flex justify-between">
                  <p className="font-medium" style={{ color: theme.colors.text.primary }}>
                    System Update {item}
                  </p>
                  <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                    {item} day{item !== 1 ? 's' : ''} ago
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: theme.colors.text.secondary }}>
                  {item % 2 === 0 
                    ? 'New features have been added to the platform.' 
                    : 'System maintenance completed successfully.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
