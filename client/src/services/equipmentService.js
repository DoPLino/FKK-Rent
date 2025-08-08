import api from './api';

class EquipmentService {
  // Get all equipment with filtering and pagination
  async getEquipment(params = {}) {
    try {
      const response = await api.get('/equipment', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch equipment',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get equipment by ID
  async getEquipmentById(id) {
    try {
      const response = await api.get(`/equipment/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching equipment by ID:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch equipment',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Create new equipment
  async createEquipment(equipmentData) {
    try {
      const response = await api.post('/equipment', equipmentData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Equipment created successfully'
      };
    } catch (error) {
      console.error('Error creating equipment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create equipment',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Update equipment
  async updateEquipment(id, equipmentData) {
    try {
      const response = await api.put(`/equipment/${id}`, equipmentData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Equipment updated successfully'
      };
    } catch (error) {
      console.error('Error updating equipment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update equipment',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Delete equipment
  async deleteEquipment(id) {
    try {
      const response = await api.delete(`/equipment/${id}`);
      return {
        success: true,
        message: response.data.message || 'Equipment deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting equipment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete equipment',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Generate QR code for equipment
  async generateQRCode(id, options = {}) {
    try {
      const response = await api.get(`/equipment/${id}/qr`, { params: options });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate QR code',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Search equipment by QR code
  async searchByQRCode(code) {
    try {
      const response = await api.get(`/qr/${encodeURIComponent(code)}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error searching by QR code:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search equipment',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get equipment statistics
  async getEquipmentStats() {
    try {
      const response = await api.get('/equipment/stats');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching equipment stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch equipment statistics',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get location statistics
  async getLocationStats() {
    try {
      const response = await api.get('/equipment/stats/locations');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching location stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch location statistics',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Check equipment availability
  async checkAvailability(equipmentId, startDate, endDate) {
    try {
      const response = await api.post('/equipment/availability', {
        equipmentId,
        startDate,
        endDate
      });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error checking availability:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check availability',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Update equipment status
  async updateEquipmentStatus(id, status, notes = '') {
    try {
      const response = await api.patch(`/equipment/${id}/status`, {
        status,
        notes
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Equipment status updated successfully'
      };
    } catch (error) {
      console.error('Error updating equipment status:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update equipment status',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Add maintenance record
  async addMaintenanceRecord(id, maintenanceData) {
    try {
      const response = await api.post(`/equipment/${id}/maintenance`, maintenanceData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Maintenance record added successfully'
      };
    } catch (error) {
      console.error('Error adding maintenance record:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add maintenance record',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get equipment categories
  async getCategories() {
    try {
      const response = await api.get('/equipment/categories');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch categories',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Export equipment data
  async exportEquipment(format = 'csv', filters = {}) {
    try {
      const response = await api.get('/equipment/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `equipment-export-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'Equipment data exported successfully'
      };
    } catch (error) {
      console.error('Error exporting equipment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export equipment data',
        error: error.response?.data?.error || error.message
      };
    }
  }
}

export const equipmentService = new EquipmentService();
