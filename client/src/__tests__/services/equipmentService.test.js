import { equipmentService } from '../../services/equipmentService';
import api from '../../services/api';

// Mock the api module
jest.mock('../../services/api');

describe('EquipmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEquipment', () => {
    it('should fetch equipment successfully', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: '1', name: 'Camera 1', status: 'available' },
            { id: '2', name: 'Camera 2', status: 'checked-out' }
          ],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 2
          }
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await equipmentService.getEquipment({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data.data);
      expect(result.pagination).toEqual(mockResponse.data.pagination);
      expect(api.get).toHaveBeenCalledWith('/equipment', { params: { page: 1, limit: 10 } });
    });

    it('should handle API errors', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Failed to fetch equipment',
            error: 'Database connection error'
          }
        }
      };

      api.get.mockRejectedValue(mockError);

      const result = await equipmentService.getEquipment();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch equipment');
      expect(result.error).toBe('Database connection error');
    });

    it('should handle network errors', async () => {
      const mockError = new Error('Network error');
      api.get.mockRejectedValue(mockError);

      const result = await equipmentService.getEquipment();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch equipment');
      expect(result.error).toBe('Network error');
    });
  });

  describe('getEquipmentById', () => {
    it('should fetch equipment by ID successfully', async () => {
      const mockEquipment = { id: '1', name: 'Camera 1', status: 'available' };
      const mockResponse = { data: { data: mockEquipment } };

      api.get.mockResolvedValue(mockResponse);

      const result = await equipmentService.getEquipmentById('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEquipment);
      expect(api.get).toHaveBeenCalledWith('/equipment/1');
    });

    it('should handle not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Equipment not found' }
        }
      };

      api.get.mockRejectedValue(mockError);

      const result = await equipmentService.getEquipmentById('999');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Equipment not found');
    });
  });

  describe('createEquipment', () => {
    it('should create equipment successfully', async () => {
      const equipmentData = {
        name: 'New Camera',
        category: 'Camera',
        serialNumber: 'CAM001'
      };

      const mockResponse = {
        data: {
          data: { id: '1', ...equipmentData },
          message: 'Equipment created successfully'
        }
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await equipmentService.createEquipment(equipmentData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data.data);
      expect(result.message).toBe('Equipment created successfully');
      expect(api.post).toHaveBeenCalledWith('/equipment', equipmentData);
    });

    it('should handle validation errors', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            errors: [
              { field: 'name', message: 'Name is required' }
            ]
          }
        }
      };

      api.post.mockRejectedValue(mockError);

      const result = await equipmentService.createEquipment({});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Validation failed');
    });
  });

  describe('updateEquipment', () => {
    it('should update equipment successfully', async () => {
      const updateData = { name: 'Updated Camera' };
      const mockResponse = {
        data: {
          data: { id: '1', ...updateData },
          message: 'Equipment updated successfully'
        }
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await equipmentService.updateEquipment('1', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data.data);
      expect(result.message).toBe('Equipment updated successfully');
      expect(api.put).toHaveBeenCalledWith('/equipment/1', updateData);
    });
  });

  describe('deleteEquipment', () => {
    it('should delete equipment successfully', async () => {
      const mockResponse = {
        data: { message: 'Equipment deleted successfully' }
      };

      api.delete.mockResolvedValue(mockResponse);

      const result = await equipmentService.deleteEquipment('1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Equipment deleted successfully');
      expect(api.delete).toHaveBeenCalledWith('/equipment/1');
    });
  });

  describe('generateQRCode', () => {
    it('should generate QR code successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            qrImageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
            qrData: { id: '1', type: 'equipment' }
          }
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await equipmentService.generateQRCode('1', { size: 300 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data.data);
      expect(api.get).toHaveBeenCalledWith('/equipment/1/qr', { params: { size: 300 } });
    });
  });

  describe('searchByQRCode', () => {
    it('should search equipment by QR code successfully', async () => {
      const qrCode = JSON.stringify({ id: '1', type: 'equipment' });
      const mockEquipment = { id: '1', name: 'Camera 1' };
      const mockResponse = { data: { data: mockEquipment } };

      api.get.mockResolvedValue(mockResponse);

      const result = await equipmentService.searchByQRCode(qrCode);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEquipment);
      expect(api.get).toHaveBeenCalledWith('/qr/' + encodeURIComponent(qrCode));
    });
  });

  describe('getEquipmentStats', () => {
    it('should fetch equipment statistics successfully', async () => {
      const mockStats = {
        overview: {
          total: 10,
          available: 5,
          checkedOut: 3,
          maintenance: 1,
          damaged: 1
        },
        byCategory: [
          { _id: 'Camera', count: 5 },
          { _id: 'Lighting', count: 3 }
        ]
      };

      const mockResponse = { data: { data: mockStats } };

      api.get.mockResolvedValue(mockResponse);

      const result = await equipmentService.getEquipmentStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
      expect(api.get).toHaveBeenCalledWith('/equipment/stats');
    });
  });

  describe('checkAvailability', () => {
    it('should check availability successfully', async () => {
      const availabilityData = {
        equipmentId: '1',
        startDate: '2024-01-01',
        endDate: '2024-01-05'
      };

      const mockResponse = {
        data: {
          data: {
            available: true,
            conflicts: []
          }
        }
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await equipmentService.checkAvailability('1', '2024-01-01', '2024-01-05');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data.data);
      expect(api.post).toHaveBeenCalledWith('/equipment/availability', availabilityData);
    });
  });

  describe('exportEquipment', () => {
    it('should export equipment data successfully', async () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });
      const mockResponse = { data: mockBlob };

      // Mock URL.createObjectURL and document methods
      const mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      const mockRevokeObjectURL = jest.fn();
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const mockClick = jest.fn();
      const mockSetAttribute = jest.fn();

      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;
      document.body.appendChild = mockAppendChild;
      document.body.removeChild = mockRemoveChild;

      const mockLink = {
        href: '',
        setAttribute: mockSetAttribute,
        click: mockClick
      };

      mockAppendChild.mockReturnValue(mockLink);

      api.get.mockResolvedValue(mockResponse);

      const result = await equipmentService.exportEquipment('csv', { status: 'available' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Equipment data exported successfully');
      expect(api.get).toHaveBeenCalledWith('/equipment/export', {
        params: { format: 'csv', status: 'available' },
        responseType: 'blob'
      });
    });
  });
});
