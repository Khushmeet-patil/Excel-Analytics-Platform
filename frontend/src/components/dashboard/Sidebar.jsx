import { useState } from 'react';
import { theme } from '../../theme';

export default function Sidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div 
      className={`h-screen transition-all duration-300 shadow-lg ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      style={{ backgroundColor: theme.colors.background.paper }}
    >
      <div className="p-4 flex justify-between items-center border-b" style={{ borderColor: theme.colors.divider }}>
        {!sidebarCollapsed && <h2 className="font-bold" style={{ color: theme.colors.text.primary }}>Menu</h2>}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1 rounded hover:bg-opacity-10 transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          {sidebarCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>
      
      <nav className="p-2">
        <ul className="space-y-2">
          <li>
            <a 
              href="#" 
              className={`flex items-center p-2 rounded-md ${sidebarCollapsed ? 'justify-center' : ''}`}
              style={{ 
                backgroundColor: theme.colors.primary.main,
                color: theme.colors.text.white 
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {!sidebarCollapsed && <span className="ml-3">Dashboard</span>}
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={`flex items-center p-2 rounded-md hover:bg-opacity-10 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
              style={{ color: theme.colors.text.primary }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {!sidebarCollapsed && <span className="ml-3">Reports</span>}
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={`flex items-center p-2 rounded-md hover:bg-opacity-10 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
              style={{ color: theme.colors.text.primary }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {!sidebarCollapsed && <span className="ml-3">New Analysis</span>}
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={`flex items-center p-2 rounded-md hover:bg-opacity-10 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
              style={{ color: theme.colors.text.primary }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {!sidebarCollapsed && <span className="ml-3">Settings</span>}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}