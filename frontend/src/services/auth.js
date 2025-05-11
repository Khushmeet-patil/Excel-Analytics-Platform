const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } else {
      return {
        success: false,
        error: data.message || 'Login failed'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

export const registerUser = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } else {
      return {
        success: false,
        error: data.message || 'Registration failed'
      };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}/auth/forgotpassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || 'Password reset email sent'
      };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to send reset email'
      };
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

export const resetPasswordWithToken = async (token, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/resetpassword/${token}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: 'Password reset successful',
        user: data.user,
        token: data.token
      };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to reset password'
      };
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

// Keeping this for backward compatibility
export const resetPassword = forgotPassword;