import api from './api';

class UserService {
  // Get all users with filtering and pagination
  async getUsers(params = {}) {
    try {
      const response = await api.get('/users', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch users',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get current user profile (align with server /api/auth/me)
  async getProfile() {
    try {
      const response = await api.get('/auth/me');
      return {
        success: true,
        data: response.data.user || response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Update user profile (align with server /api/auth/me)
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/me', profileData);
      return {
        success: true,
        data: response.data.user || response.data.data || response.data,
        message: response.data.message || 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Create new user (admin only)
  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'User created successfully'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create user',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Update user (admin only)
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'User updated successfully'
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Delete user (admin only)
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return {
        success: true,
        message: response.data.message || 'User deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete user',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Update user role (admin only)
  async updateUserRole(id, role) {
    try {
      const response = await api.patch(`/users/${id}/role`, { role });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'User role updated successfully'
      };
    } catch (error) {
      console.error('Error updating user role:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user role',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Change password (align with server PUT /api/auth/change-password)
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return {
        success: true,
        message: response.data.message || 'Password changed successfully'
      };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Reset password (admin only)
  async resetPassword(id) {
    try {
      const response = await api.post(`/users/${id}/reset-password`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Password reset successfully'
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get user statistics (align with server route)
  async getUserStats() {
    try {
      const response = await api.get('/users/stats/overview');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user statistics',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get user activity
  async getUserActivity(id, params = {}) {
    try {
      const response = await api.get(`/users/${id}/activity`, { params });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user activity',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get user permissions
  async getUserPermissions(id) {
    try {
      const response = await api.get(`/users/${id}/permissions`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user permissions',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Update user permissions (admin only)
  async updateUserPermissions(id, permissions) {
    try {
      const response = await api.put(`/users/${id}/permissions`, { permissions });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'User permissions updated successfully'
      };
    } catch (error) {
      console.error('Error updating user permissions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user permissions',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Upload profile picture
  async uploadProfilePicture(file) {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.post('/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Profile picture uploaded successfully'
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload profile picture',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Export users
  async exportUsers(format = 'csv', filters = {}) {
    try {
      const response = await api.get('/users/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'Users exported successfully'
      };
    } catch (error) {
      console.error('Error exporting users:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export users',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Bulk operations
  async bulkUpdateRole(userIds, role) {
    try {
      const response = await api.post('/users/bulk/role', {
        userIds,
        role
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'User roles updated successfully'
      };
    } catch (error) {
      console.error('Error bulk updating user roles:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user roles',
        error: error.response?.data?.error || error.message
      };
    }
  }

  async bulkDelete(userIds) {
    try {
      const response = await api.post('/users/bulk/delete', {
        userIds
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Users deleted successfully'
      };
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete users',
        error: error.response?.data?.error || error.message
      };
    }
  }
}

export const userService = new UserService();
