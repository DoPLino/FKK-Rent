import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  FilmIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { equipmentService } from '../../services/equipmentService';
import { bookingService } from '../../services/bookingService';
import { toast } from 'react-hot-toast';

const BookingForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [formData, setFormData] = useState({
    equipmentId: searchParams.get('equipment') || '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    purpose: '',
    notes: '',
    priority: 'normal'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadEquipment();
  }, []);

  useEffect(() => {
    if (formData.equipmentId && formData.startDate && formData.endDate) {
      checkAvailability();
    }
  }, [formData.equipmentId, formData.startDate, formData.endDate]);

  const loadEquipment = async () => {
    try {
      const response = await equipmentService.getEquipment();
      if (response.success) {
        setEquipment(response.data);
        
        // If equipment ID is in URL params, set it as selected
        const equipmentId = searchParams.get('equipment');
        if (equipmentId) {
          const selected = response.data.find(eq => eq.id === equipmentId);
          if (selected) {
            setSelectedEquipment(selected);
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load equipment');
      console.error('Error loading equipment:', error);
    }
  };

  const checkAvailability = async () => {
    try {
      const response = await bookingService.checkAvailability({
        equipmentId: formData.equipmentId,
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      
      if (response.success) {
        setAvailability(response.data);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEquipmentSelect = (equipmentId) => {
    const selected = equipment.find(eq => eq.id === equipmentId);
    setSelectedEquipment(selected);
    setFormData(prev => ({
      ...prev,
      equipmentId
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.equipmentId) {
      newErrors.equipmentId = 'Please select equipment';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
      
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await bookingService.createBooking(formData);
      
      if (response.success) {
        toast.success('Booking created successfully!');
        navigate('/bookings');
      } else {
        toast.error(response.message || 'Failed to create booking');
      }
    } catch (error) {
      toast.error('Failed to create booking');
      console.error('Error creating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      available: 'status-available',
      booked: 'status-checked-out',
      maintenance: 'status-maintenance',
      damaged: 'status-damaged'
    };
    return statusClasses[status] || 'status-maintenance';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      available: 'Available',
      booked: 'Booked',
      maintenance: 'Maintenance',
      damaged: 'Damaged'
    };
    return statusTexts[status] || status;
  };

  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/bookings')}
            className="btn-outline"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Bookings
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              New Booking
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create a new equipment booking
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Equipment Selection */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Equipment Selection
              </h2>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label htmlFor="equipmentId" className="form-label">
                  Select Equipment *
                </label>
                <select
                  id="equipmentId"
                  name="equipmentId"
                  value={formData.equipmentId}
                  onChange={handleChange}
                  className={`form-input ${errors.equipmentId ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                >
                  <option value="">Choose equipment...</option>
                  {equipment.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.category} ({getStatusText(item.status)})
                    </option>
                  ))}
                </select>
                {errors.equipmentId && <p className="form-error">{errors.equipmentId}</p>}
              </div>

              {selectedEquipment && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <FilmIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {selectedEquipment.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedEquipment.category}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`status-badge ${getStatusBadgeClass(selectedEquipment.status)}`}>
                          {getStatusText(selectedEquipment.status)}
                        </span>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {selectedEquipment.location}
                        </div>
                      </div>
                      {selectedEquipment.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {selectedEquipment.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Booking Details
              </h2>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="form-label">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`form-input ${errors.startDate ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  />
                  {errors.startDate && <p className="form-error">{errors.startDate}</p>}
                </div>
                <div>
                  <label htmlFor="endDate" className="form-label">
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className={`form-input ${errors.endDate ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  />
                  {errors.endDate && <p className="form-error">{errors.endDate}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="form-label">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="form-label">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="purpose" className="form-label">
                  Purpose *
                </label>
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="e.g., Film production, Photography session, Event coverage"
                  className={`form-input ${errors.purpose ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                />
                {errors.purpose && <p className="form-error">{errors.purpose}</p>}
              </div>

              <div>
                <label htmlFor="priority" className="form-label">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="form-label">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional information about your booking..."
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Availability Check */}
          {availability && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Availability Check
                </h2>
              </div>
              <div className="card-body">
                {availability.available ? (
                  <div className="flex items-center space-x-3 p-4 bg-success-50 dark:bg-success-900 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-success-500" />
                    <div>
                      <p className="font-medium text-success-700 dark:text-success-300">
                        Equipment is available for your selected dates
                      </p>
                      <p className="text-sm text-success-600 dark:text-success-400">
                        No conflicts found with existing bookings
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-4 bg-warning-50 dark:bg-warning-900 rounded-lg">
                    <ExclamationTriangleIcon className="w-6 h-6 text-warning-500" />
                    <div>
                      <p className="font-medium text-warning-700 dark:text-warning-300">
                        Equipment may not be available
                      </p>
                      <p className="text-sm text-warning-600 dark:text-warning-400">
                        {availability.conflicts?.length || 0} conflicting bookings found
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Booking Summary
              </h3>
            </div>
            <div className="card-body space-y-4">
              {selectedEquipment && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <FilmIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedEquipment.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedEquipment.category}
                    </p>
                  </div>
                </div>
              )}

              {formData.startDate && formData.endDate && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {calculateDuration()} day{calculateDuration() !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Start</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(formData.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">End</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(formData.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Priority</span>
                <span className={`status-badge ${
                  formData.priority === 'urgent' ? 'status-damaged' :
                  formData.priority === 'high' ? 'status-checked-out' :
                  formData.priority === 'normal' ? 'status-available' : 'status-maintenance'
                }`}>
                  {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Information
              </h3>
            </div>
            <div className="card-body space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Role: <span className="font-medium capitalize">{user?.role}</span></p>
                <p>Department: <span className="font-medium">{user?.department || 'Not specified'}</span></p>
              </div>
            </div>
          </div>

          {/* Booking Tips */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Booking Tips
              </h3>
            </div>
            <div className="card-body space-y-3">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-info-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Plan Ahead
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Book equipment at least 24 hours in advance for better availability
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-info-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Be Specific
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Include detailed purpose and notes to help with equipment setup
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-info-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Check Availability
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Review the availability check to ensure no conflicts
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <div className="card-body space-y-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Creating Booking...' : 'Create Booking'}
              </button>
              <button
                onClick={() => navigate('/bookings')}
                className="btn-outline w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
