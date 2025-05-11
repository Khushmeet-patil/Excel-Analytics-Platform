import { useState } from 'react';
import { theme } from '../../theme';

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.name.match(/\.(xlsx|xls|csv)$/)) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid Excel or CSV file');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text.primary }}>Dashboard</h1>
        <p className="text-gray-600">Welcome to your Excel Analytics dashboard</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: theme.colors.background.paper }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text.primary }}>Upload Excel File</h2>
          <p className="mb-4" style={{ color: theme.colors.text.secondary }}>Drag and drop or click to upload your Excel spreadsheets</p>
          <label>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-opacity-10 transition-colors"
              style={{ borderColor: theme.colors.primary.light, backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <p style={{ color: theme.colors.text.primary }}>
                {selectedFile ? `Selected: ${selectedFile.name}` : 'Drop files here or click to browse'}
              </p>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {selectedFile && (
            <button
              className="mt-4 w-full py-2 px-4 rounded-md text-center transition-colors"
              style={{
                backgroundColor: theme.colors.secondary.main,
                color: theme.colors.text.white
              }}
            >
              Upload & Analyze
            </button>
          )}
        </div>

        <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: theme.colors.background.paper }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text.primary }}>Recent Files</h2>
          <div className="space-y-2" style={{ color: theme.colors.text.secondary }}>
            {selectedFile ? (
              <div className="p-3 rounded-md flex items-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <span className="mr-2">📄</span>
                <span>{selectedFile.name}</span>
              </div>
            ) : (
              <p>You haven't uploaded any files yet</p>
            )}
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: theme.colors.background.paper }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text.primary }}>Quick Actions</h2>
          <div className="space-y-2">
            <button
              className="w-full py-2 px-4 rounded-md text-left hover:bg-opacity-10 transition-colors flex items-center"
              style={{
                backgroundColor: theme.colors.secondary.main,
                color: theme.colors.text.white
              }}
            >
              <span className="mr-2">📊</span> New Visualization
            </button>
            <button
              className="w-full py-2 px-4 rounded-md text-left hover:bg-opacity-10 transition-colors flex items-center"
              style={{
                backgroundColor: theme.colors.secondary.main,
                color: theme.colors.text.white
              }}
            >
              <span className="mr-2">✨</span> AI Analysis
            </button>
            <button
              className="w-full py-2 px-4 rounded-md text-left hover:bg-opacity-10 transition-colors flex items-center"
              style={{
                backgroundColor: theme.colors.secondary.main,
                color: theme.colors.text.white
              }}
            >
              <span className="mr-2">🔄</span> Data Transformation
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Overview Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6" style={{ color: theme.colors.text.primary }}>Analytics Overview</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: theme.colors.background.paper }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>Data Summary</h3>
            {selectedFile ? (
              <div className="space-y-4">
                <p style={{ color: theme.colors.text.secondary }}>
                  Selected file: {selectedFile.name}
                </p>
                <div className="h-64 flex items-center justify-center border rounded-md" style={{ borderColor: theme.colors.primary.light }}>
                  <p style={{ color: theme.colors.text.secondary }}>Upload file to view data summary</p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p style={{ color: theme.colors.text.secondary }}>No file selected</p>
              </div>
            )}
          </div>

          <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: theme.colors.background.paper }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>Visualization Preview</h3>
            <div className="h-64 flex items-center justify-center border rounded-md" style={{ borderColor: theme.colors.primary.light }}>
              <p style={{ color: theme.colors.text.secondary }}>Select data to preview visualizations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
