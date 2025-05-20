import { useState } from 'react';
import { theme } from '../theme';

export default function Settings() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Excel Analytics Platform',
    siteDescription: 'Advanced Excel data analysis and visualization platform',
    contactEmail: 'admin@excelanalytics.com',
    maxUploadSize: '50',
    defaultLanguage: 'en',
    timezone: 'UTC',
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'notifications@excelanalytics.com',
    smtpPassword: '••••••••••••',
    senderName: 'Excel Analytics',
    senderEmail: 'no-reply@excelanalytics.com',
  });

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    // Save settings logic would go here
    alert('General settings saved!');
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Save email settings logic would go here
    alert('Email settings saved!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
          System Settings
        </h2>
        <p style={{ color: theme.colors.text.primary }}>
          Configure global settings for the Excel Analytics platform.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
          General Settings
        </h3>
        <form onSubmit={handleGeneralSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Site Name
              </label>
              <input
                type="text"
                value={generalSettings.siteName}
                onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Site Description
              </label>
              <input
                type="text"
                value={generalSettings.siteDescription}
                onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Contact Email
              </label>
              <input
                type="email"
                value={generalSettings.contactEmail}
                onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Max Upload Size (MB)
              </label>
              <input
                type="number"
                value={generalSettings.maxUploadSize}
                onChange={(e) => setGeneralSettings({...generalSettings, maxUploadSize: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Default Language
              </label>
              <select
                value={generalSettings.defaultLanguage}
                onChange={(e) => setGeneralSettings({...generalSettings, defaultLanguage: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Timezone
              </label>
              <select
                value={generalSettings.timezone}
                onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Standard Time</option>
                <option value="CST">Central Standard Time</option>
                <option value="PST">Pacific Standard Time</option>
              </select>
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
              Save General Settings
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
          Email Settings
        </h3>
        <form onSubmit={handleEmailSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                SMTP Server
              </label>
              <input
                type="text"
                value={emailSettings.smtpServer}
                onChange={(e) => setEmailSettings({...emailSettings, smtpServer: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                SMTP Port
              </label>
              <input
                type="text"
                value={emailSettings.smtpPort}
                onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                SMTP Username
              </label>
              <input
                type="text"
                value={emailSettings.smtpUsername}
                onChange={(e) => setEmailSettings({...emailSettings, smtpUsername: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                SMTP Password
              </label>
              <input
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Sender Name
              </label>
              <input
                type="text"
                value={emailSettings.senderName}
                onChange={(e) => setEmailSettings({...emailSettings, senderName: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                style={{ borderColor: theme.colors.divider }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Sender Email
              </label>
              <input
                type="email"
                value={emailSettings.senderEmail}
                onChange={(e) => setEmailSettings({...emailSettings, senderEmail: e.target.value})}
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
              Save Email Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
