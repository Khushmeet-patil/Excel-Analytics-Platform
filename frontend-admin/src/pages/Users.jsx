import { theme } from '../theme';

export default function Users() {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', projects: 5, lastLogin: '2 hours ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active', projects: 3, lastLogin: '1 day ago' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'admin', status: 'active', projects: 8, lastLogin: '3 hours ago' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'user', status: 'inactive', projects: 2, lastLogin: '2 weeks ago' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'user', status: 'active', projects: 6, lastLogin: '5 days ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold" style={{ color: theme.colors.text.primary }}>
            User Management
          </h2>
          <button
            className="px-4 py-2 rounded-md"
            style={{
              backgroundColor: theme.colors.secondary.main,
              color: theme.colors.secondary.contrastText
            }}
          >
            Add New User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: theme.colors.divider }}>
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y" style={{ borderColor: theme.colors.divider }}>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white"
                        style={{ backgroundColor: theme.colors.secondary.main }}>
                        {user.name.charAt(0)}
                      </div>
                      <span style={{ color: theme.colors.text.primary }}>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text.primary }}>
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text.primary }}>
                    {user.projects}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text.primary }}>
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
