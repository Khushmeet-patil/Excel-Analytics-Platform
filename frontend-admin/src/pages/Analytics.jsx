import { theme } from '../theme';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
          Platform Analytics
        </h2>
        <p style={{ color: theme.colors.text.primary }}>
          View detailed analytics and usage statistics for the Excel Analytics platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            User Growth
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
            <p style={{ color: theme.colors.text.secondary }}>User Growth Chart Placeholder</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            Active Projects
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
            <p style={{ color: theme.colors.text.secondary }}>Projects Chart Placeholder</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            Data Processing
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
            <p style={{ color: theme.colors.text.secondary }}>Data Processing Chart Placeholder</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            Feature Usage
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
            <p style={{ color: theme.colors.text.secondary }}>Feature Usage Chart Placeholder</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
          Monthly Statistics
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: theme.colors.divider }}>
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  New Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  Active Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  New Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.text.secondary }}>
                  Data Processed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y" style={{ borderColor: theme.colors.divider }}>
              {['January', 'February', 'March', 'April', 'May'].map((month, index) => (
                <tr key={month}>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text.primary }}>
                    {month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text.primary }}>
                    {Math.floor(Math.random() * 50) + 10}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text.primary }}>
                    {Math.floor(Math.random() * 200) + 100}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text.primary }}>
                    {Math.floor(Math.random() * 30) + 5}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: theme.colors.text.primary }}>
                    {(Math.random() * 100).toFixed(2)} GB
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
