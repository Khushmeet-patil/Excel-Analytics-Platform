import { theme } from '../../theme';
import { Users, BarChart3, Settings, Shield } from 'lucide-react';

export default function Features() {
  const features = [
    {
      title: 'User Management',
      description: 'Manage user accounts, permissions, and access controls.',
      icon: <Users size={40} />,
    },
    {
      title: 'Analytics Dashboard',
      description: 'View platform usage statistics and performance metrics.',
      icon: <BarChart3 size={40} />,
    },
    {
      title: 'System Configuration',
      description: 'Configure system settings, integrations, and preferences.',
      icon: <Settings size={40} />,
    },
    {
      title: 'Security Controls',
      description: 'Monitor and manage security settings and access logs.',
      icon: <Shield size={40} />,
    },
  ];

  return (
    <div className="py-16 px-6" style={{ backgroundColor: theme.colors.background.default }}>
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: theme.colors.text.primary }}>
          Admin Panel Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 rounded-lg shadow-md flex flex-col items-center text-center"
              style={{ backgroundColor: theme.colors.background.paper }}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ 
                  backgroundColor: `${theme.colors.secondary.main}15`,
                  color: theme.colors.secondary.main
                }}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text.primary }}>
                {feature.title}
              </h3>
              <p style={{ color: theme.colors.text.primary }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
