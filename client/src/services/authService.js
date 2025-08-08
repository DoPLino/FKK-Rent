import api from './api';

class AuthService {
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        error: error.response?.data?.error || error.message
      };
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        error: error.response?.data?.error || error.message
      };
    }
  }

  async getProfile() {
    try {
      // Server route is GET /api/auth/me and returns { user: ... }
      const response = await api.get('/auth/me');
      return {
        success: true,
        // Normalize to return the user object directly
        data: response.data.data || response.data.user || response.data
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get profile',
        error: error.response?.data?.error || error.message
      };
    }
  }

  async updateProfile(profileData) {
    try {
      // Server route is PUT /api/auth/me and returns { user: ... }
      const response = await api.put('/auth/me', profileData);
      return {
        success: true,
        // Normalize to return the user object directly
        data: response.data.data || response.data.user || response.data
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
        error: error.response?.data?.error || error.message
      };
    }
  }

  async changePassword(passwordData) {
    try {
      // Server expects PUT /api/auth/change-password
      const response = await api.put('/auth/change-password', passwordData);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password',
        error: error.response?.data?.error || error.message
      };
    }
  }

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email',
        error: error.response?.data?.error || error.message
      };
    }
  }

  async resetPassword(resetToken, newPassword) {
    try {
      // Server expects { resetToken, newPassword }
      const response = await api.post('/auth/reset-password', { resetToken, newPassword });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password',
        error: error.response?.data?.error || error.message
      };
    }
  }

  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to refresh token',
        error: error.response?.data?.error || error.message
      };
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}

export const authService = new AuthService();
