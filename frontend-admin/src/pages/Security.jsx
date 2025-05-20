import { useState } from 'react';
import { theme } from '../theme';

export default function Security() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordExpiry: '90',
    minPasswordLength: '8',
    requireSpecialChars: true,
    maxLoginAttempts: '5',
    sessionTimeout: '30',
  });

  const [accessLogs] = useState([
    { id: 1, user: 'admin@example.com', action: 'Login', status: 'Success', ip: '192.168.1.1', timestamp: '2023-06-15 14:32:45' },
    { id: 2, user: 'john@example.com', action: 'Login', status: 'Failed', ip: '203.0.113.42', timestamp: '2023-06-15 13:45:22' },
    { id: 3, user: 'admin@example.com', action: 'Settings Update', status: 'Success', ip: '192.168.1.1', timestamp: '2023-06-15 12:18:33' },
    { id: 4, user: 'jane@example.com', action: 'Password Reset', status: 'Success', ip: '198.51.100.73', timestamp: '2023-06-14 16:55:10' },
    { id: 5, user: 'bob@example.com', action: 'Login', status: 'Success', ip: '203.0.113.105', timestamp: '2023-06-14 11:22:18' },
  ]);

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    // Save security settings logic would go here
    alert('Security settings saved!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
          Security Controls
        </h2>
        <p style={{ color: theme.colors.text.primary }}>
          Manage security settings and monitor access logs.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
          Security Settings
        </h3>
        <form onSubmit={handleSecuritySubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorAuth}
                  onChange={(e) => setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked})}
                  className="mr-2"
                />
                <span style={{ color: theme.colors.text.primary }}>Enable Two-Factor Authentication</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Password Expiry (days)
              </label>
              <input
                type="number"
                value={securitySettings.passwordExpiry}
                onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Minimum Password Length
              </label>
              <input
                type="number"
                value={securitySettings.minPasswordLength}
                onChange={(e) => setSecuritySettings({...securitySettings, minPasswordLength: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={securitySettings.requireSpecialChars}
                  onChange={(e) => setSecuritySettings({...securitySettings, requireSpecialChars: e.target.checked})}
                  className="mr-2"
                />
                <span style={{ color: theme.colors.text.primary }}>Require Special Characters in Password</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Max Login Attempts
              </label>
              <input
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 rounded-md"
              style={{
                backgroundColor: theme.colors.secondary.main,
                color: theme.colors.secondary.contrastText
              }}
            >
              Save Security Settings
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
          Access Logs
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: theme.colors.divider }}>
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y" style={{ borderColor: theme.colors.divider }}>
              {accessLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text.primary }}>
                    {log.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text.primary }}>
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      log.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text.primary }}>
                    {log.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text.primary }}>
                    {log.timestamp}
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
