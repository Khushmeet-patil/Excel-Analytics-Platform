export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };
  
  export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Add any other items to remove
  };
  
  export const getUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  };