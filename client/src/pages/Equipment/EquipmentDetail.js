import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  QrCodeIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CameraIcon,
  TagIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { equipmentService } from '../../services/equipmentService';
import { bookingService } from '../../services/bookingService';
import { toast } from 'react-hot-toast';

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    loadEquipmentDetails();
  }, [id]);

  const loadEquipmentDetails = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getEquipmentById(id);
      if (response.success) {
        setEquipment(response.data);
        // Load related bookings
        const bookingsResponse = await bookingService.getBookings();
        if (bookingsResponse.success) {
          const equipmentBookings = bookingsResponse.data.filter(
            booking => booking.equipmentId === id || booking.equipment === response.data.name
          );
          setBookings(equipmentBookings);
        }
      } else {
        toast.error('Equipment not found');
        navigate('/equipment');
      }
    } catch (error) {
      toast.error('Failed to load equipment details');
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusLoading(true);
      await equipmentService.updateEquipmentStatus(id, newStatus);
      setEquipment(prev => ({ ...prev, status: newStatus }));
      toast.success(`Equipment status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
      try {
        await equipmentService.deleteEquipment(id);
        toast.success('Equipment deleted successfully');
        navigate('/equipment');
      } catch (error) {
        toast.error('Failed to delete equipment');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      available: 'status-available',
      'checked-out': 'status-checked-out',
      'in-custody': 'status-in-custody',
      maintenance: 'status-maintenance',
      damaged: 'status-damaged'
    };
    return statusClasses[status] || 'status-maintenance';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      available: 'Available',
      'checked-out': 'Checked Out',
      'in-custody': 'In Custody',
      maintenance: 'Maintenance',
      damaged: 'Damaged'
    };
    return statusTexts[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      available: CheckCircleIcon,
      'checked-out': ClockIcon,
      'in-custody': UserIcon,
      maintenance: WrenchScrewdriverIcon,
      damaged: ExclamationTriangleIcon
    };
    return icons[status] || InformationCircleIcon;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Equipment not found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The equipment you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/equipment" className="btn-primary">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Equipment
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/equipment"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {equipment.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Equipment Details
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            to={`/equipment/${id}/edit`}
            className="btn-outline"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </Link>
          <Link
            to={`/equipment/${id}/qr`}
            className="btn-outline"
          >
            <QrCodeIcon className="w-4 h-4 mr-2" />
            QR Code
          </Link>
          <button
            onClick={handleDelete}
            className="btn-danger"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Equipment Image and Basic Info */}
          <div className="card">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  {equipment.image ? (
                    <img
                      src={equipment.image}
                      alt={equipment.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <CameraIcon className="w-16 h-16 text-gray-400" />
                  )}
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {equipment.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {equipment.description || 'No description available'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <TagIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Category: <span className="font-medium capitalize">{equipment.category || 'Uncategorized'}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Location: <span className="font-medium">{equipment.location || 'Unknown'}</span>
                      </span>
                    </div>

                    {equipment.serialNumber && (
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Serial: <span className="font-mono font-medium">{equipment.serialNumber}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Status Management
              </h3>
            </div>
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {React.createElement(getStatusIcon(equipment.status), { 
                    className: "w-6 h-6 text-gray-400" 
                  })}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
                    <span className={`status-badge ${getStatusBadgeClass(equipment.status)}`}>
                      {getStatusText(equipment.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {['available', 'checked-out', 'in-custody', 'maintenance', 'damaged'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={statusLoading || equipment.status === status}
                    className={`p-3 rounded-lg border transition-colors ${
                      equipment.status === status
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                    } ${statusLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="text-center">
                      {React.createElement(getStatusIcon(status), { 
                        className: `w-5 h-5 mx-auto mb-1 ${
                          equipment.status === status ? 'text-primary-500' : 'text-gray-400'
                        }` 
                      })}
                      <span className="text-xs font-medium capitalize">
                        {getStatusText(status)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Booking History */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Booking History
                </h3>
                <Link
                  to={`/bookings/new?equipment=${id}`}
                  className="btn-primary btn-sm"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  New Booking
                </Link>
              </div>
            </div>
            <div className="card-body">
              {bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {booking.user || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`status-badge ${
                        booking.status === 'active' ? 'status-checked-out' : 'status-available'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No booking history</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h3>
            </div>
            <div className="card-body space-y-3">
              <button className="btn-outline w-full">
                <QrCodeIcon className="w-4 h-4 mr-2" />
                Generate QR Code
              </button>
              <button className="btn-outline w-full">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Export Details
              </button>
              <Link
                to={`/bookings/new?equipment=${id}`}
                className="btn-primary w-full"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Book Equipment
              </Link>
            </div>
          </div>

          {/* Equipment Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Equipment Info
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(equipment.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(equipment.updatedAt).toLocaleDateString()}
                </p>
              </div>

              {equipment.condition && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Condition</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {equipment.condition}
                  </p>
                </div>
              )}

              {equipment.value && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Value</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ${equipment.value}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance History */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Maintenance
              </h3>
            </div>
            <div className="card-body">
              <div className="text-center py-4">
                <WrenchScrewdriverIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No maintenance records</p>
                <button className="btn-outline btn-sm mt-3">
                  Add Record
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
