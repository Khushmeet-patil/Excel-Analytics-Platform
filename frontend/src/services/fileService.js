const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const getHeaders = (includeContentType = true) => {
  const token = getToken();
  const headers = { Authorization: token ? `Bearer ${token}` : '' };
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const getProjectFiles = async (projectId) => {
  try {
    const response = await fetch(`${API_URL}/files/project/${projectId}`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching project files:', error);
    throw error;
  }
};

export const getFileById = async (fileId, forceRefresh = false) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication token is missing. Please log in again.');
    }

    // Add a query parameter to force refresh from Cloudinary if needed
    const url = forceRefresh
      ? `${API_URL}/files/${fileId}?refresh=true`
      : `${API_URL}/files/${fileId}`;

    console.log(`Fetching file data from: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Your session has expired. Please log in again.');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to access this file.');
      } else if (response.status === 404) {
        throw new Error('The requested file could not be found.');
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const responseData = await response.json();
    if (!responseData.success || !responseData.data) {
      throw new Error('Invalid response format from server');
    }

    return responseData.data;
  } catch (error) {
    console.error('Error fetching file:', error);
    throw error;
  }
};

export const uploadExcelFile = async (projectId, files) => {
  try {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach(file => formData.append('files', file));
    } else {
      formData.append('files', files);
    }

    const response = await fetch(`${API_URL}/files/upload/${projectId}`, {
      method: 'POST',
      headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' },
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (fileId) => {
  try {
    const response = await fetch(`${API_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const preprocessData = async (fileId, operation, params) => {
  try {
    const response = await fetch(`${API_URL}/data/preprocess/${fileId}`, {
      method: 'POST',
      headers: getHeaders(true),
      credentials: 'include',
      body: JSON.stringify({ operation, params }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error preprocessing data:', error);
    throw error;
  }
};

export const normalizeData = async (fileId, operation, columns) => {
  try {
    const response = await fetch(`${API_URL}/data/normalize/${fileId}`, {
      method: 'POST',
      headers: getHeaders(true),
      credentials: 'include',
      body: JSON.stringify({ operation, columns }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error normalizing data:', error);
    throw error;
  }
};

export const downloadFile = (fileId, dataType = 'processed') => {
  const token = getToken();
  const url = `${API_URL}/data/download/${fileId}?dataType=${dataType}`;

  fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
    credentials: 'include',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `file-${fileId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(error => {
      console.error('Error downloading file:', error);
    });
};

export const featureEngineeringData = async (fileId, operation, params) => {
  try {
    const response = await fetch(`${API_URL}/data/features/${fileId}`, {
      method: 'POST',
      headers: getHeaders(true),
      credentials: 'include',
      body: JSON.stringify({ operation, params }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error performing feature engineering:', error);
    throw error;
  }
};

export const saveFile = async (fileId) => {
  try {
    const response = await fetch(`${API_URL}/data/save/${fileId}`, {
      method: 'POST',
      headers: getHeaders(true),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};

export const getFileAnalysis = async (fileId) => {
  try {
    const response = await fetch(`${API_URL}/data/analysis/${fileId}`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting file analysis:', error);
    throw error;
  }
};

// Local storage key for visualizations
const VISUALIZATIONS_STORAGE_KEY = 'excel_analytics_visualizations';

// Get visualizations from local storage
export const getVisualizations = (fileId) => {
  try {
    const allVisualizations = JSON.parse(localStorage.getItem(VISUALIZATIONS_STORAGE_KEY) || '{}');
    return allVisualizations[fileId] || [];
  } catch (error) {
    console.error('Error getting visualizations from storage:', error);
    return [];
  }
};

// Save a visualization to local storage
export const saveVisualization = (fileId, visualization) => {
  try {
    const allVisualizations = JSON.parse(localStorage.getItem(VISUALIZATIONS_STORAGE_KEY) || '{}');
    const fileVisualizations = allVisualizations[fileId] || [];

    // Add unique ID and ensure timestamp
    const newVisualization = {
      ...visualization,
      id: Date.now().toString(),
      timestamp: visualization.timestamp || new Date().toISOString()
    };

    // Add to the beginning of the array (newest first)
    fileVisualizations.unshift(newVisualization);

    // Update storage
    allVisualizations[fileId] = fileVisualizations;
    localStorage.setItem(VISUALIZATIONS_STORAGE_KEY, JSON.stringify(allVisualizations));

    return newVisualization;
  } catch (error) {
    console.error('Error saving visualization to storage:', error);
    throw error;
  }
};

// Delete a visualization from local storage
export const deleteVisualization = (fileId, visualizationId) => {
  try {
    const allVisualizations = JSON.parse(localStorage.getItem(VISUALIZATIONS_STORAGE_KEY) || '{}');
    const fileVisualizations = allVisualizations[fileId] || [];

    // Filter out the visualization to delete
    allVisualizations[fileId] = fileVisualizations.filter(v => v.id !== visualizationId);

    // Update storage
    localStorage.setItem(VISUALIZATIONS_STORAGE_KEY, JSON.stringify(allVisualizations));

    return allVisualizations[fileId];
  } catch (error) {
    console.error('Error deleting visualization from storage:', error);
    throw error;
  }
};