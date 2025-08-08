import api from './api';

class BookingService {
  // Get all bookings with filtering and pagination
  async getBookings(params = {}) {
    try {
      const response = await api.get('/bookings', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch bookings',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get booking by ID
  async getBookingById(id) {
    try {
      const response = await api.get(`/bookings/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching booking by ID:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch booking',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Create new booking
  async createBooking(bookingData) {
    try {
      const response = await api.post('/bookings', bookingData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Booking created successfully'
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create booking',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Update booking
  async updateBooking(id, bookingData) {
    try {
      const response = await api.put(`/bookings/${id}`, bookingData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Booking updated successfully'
      };
    } catch (error) {
      console.error('Error updating booking:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update booking',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Approve booking
  async approveBooking(id, notes = '') {
    try {
      const response = await api.patch(`/bookings/${id}/approve`, { notes });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Booking approved successfully'
      };
    } catch (error) {
      console.error('Error approving booking:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to approve booking',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Cancel booking
  async cancelBooking(id, reason = '') {
    try {
      const response = await api.patch(`/bookings/${id}/cancel`, { reason });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Booking cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel booking',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Check equipment availability
  async checkAvailability(equipmentId, startDate, endDate) {
    try {
      const response = await api.post('/bookings/availability', {
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

  // Get user bookings
  async getUserBookings(params = {}) {
    try {
      const response = await api.get('/bookings/user', { params });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user bookings',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get booking statistics
  async getBookingStats() {
    try {
      const response = await api.get('/bookings/stats');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch booking statistics',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get monthly trends
  async getMonthlyTrends() {
    try {
      const response = await api.get('/bookings/stats/monthly');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching monthly trends:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch monthly trends',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get upcoming bookings
  async getUpcomingBookings(limit = 10) {
    try {
      const response = await api.get('/bookings/upcoming', { params: { limit } });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch upcoming bookings',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get overdue bookings
  async getOverdueBookings() {
    try {
      const response = await api.get('/bookings/overdue');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching overdue bookings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch overdue bookings',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Export bookings
  async exportBookings(format = 'csv', filters = {}) {
    try {
      const response = await api.get('/bookings/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings-export-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'Bookings exported successfully'
      };
    } catch (error) {
      console.error('Error exporting bookings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export bookings',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get booking calendar data
  async getBookingCalendar(startDate, endDate) {
    try {
      const response = await api.get('/bookings/calendar', {
        params: { startDate, endDate }
      });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching booking calendar:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch booking calendar',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Bulk operations
  async bulkApprove(bookingIds, notes = '') {
    try {
      const response = await api.post('/bookings/bulk/approve', {
        bookingIds,
        notes
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Bookings approved successfully'
      };
    } catch (error) {
      console.error('Error bulk approving bookings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to approve bookings',
        error: error.response?.data?.error || error.message
      };
    }
  }

  async bulkCancel(bookingIds, reason = '') {
    try {
      const response = await api.post('/bookings/bulk/cancel', {
        bookingIds,
        reason
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Bookings cancelled successfully'
      };
    } catch (error) {
      console.error('Error bulk cancelling bookings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel bookings',
        error: error.response?.data?.error || error.message
      };
    }
  }
}

export const bookingService = new BookingService();
