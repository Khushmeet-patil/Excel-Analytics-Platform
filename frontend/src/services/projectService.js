// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Headers with auth token
const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// Get all projects for the current user
export const getAllProjects = async () => {
  try {
    // Always make the actual API call to get real data
    const response = await fetch(`${API_URL}/projects`, {
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
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Search projects
export const searchProjects = async (query) => {
  try {
    const response = await fetch(`${API_URL}/projects/search?query=${encodeURIComponent(query)}`, {
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
    console.error('Error searching projects:', error);
    throw error;
  }
};

// Get a specific project by ID
export const getProjectById = async (projectId) => {
  try {
    // Validate projectId
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    if (projectId === 'undefined' || projectId === 'null') {
      throw new Error('Invalid project ID');
    }

    // Ensure projectId is a valid string before making the request
    if (typeof projectId !== 'string' && typeof projectId !== 'number') {
      throw new Error('Invalid project ID format');
    }

    // Make the API request
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 404) {
        throw new Error('Project not found');
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();

    // Validate response data
    if (!data || !data.data) {
      throw new Error('Invalid response from server');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

// Create a new project
export const createProject = async (projectData) => {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// Update an existing project
export const updateProject = async (projectId, projectData) => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

// Delete a project
export const deleteProject = async (projectId) => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
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
    console.error('Error deleting project:', error);
    throw error;
  }
};
