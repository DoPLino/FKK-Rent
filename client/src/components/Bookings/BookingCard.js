import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  FilmIcon,
  MapPinIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const BookingCard = ({ 
  booking, 
  onView, 
  onEdit, 
  onDelete, 
  onCancel,
  showActions = true,
  compact = false 
}) => {
  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      active: 'status-checked-out',
      pending: 'status-maintenance',
      completed: 'status-available',
      cancelled: 'status-damaged',
      overdue: 'status-damaged'
    };
    return statusClasses[status] || 'status-maintenance';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      active: 'Active',
      pending: 'Pending',
      completed: 'Completed',
      cancelled: 'Cancelled',
      overdue: 'Overdue'
    };
    return statusTexts[status] || status;
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      active: CheckCircleIcon,
      pending: ClockIcon,
      completed: CheckCircleIcon,
      cancelled: XMarkIcon,
      overdue: ExclamationTriangleIcon
    };
    return statusIcons[status] || ClockIcon;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Format HH:MM
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const StatusIcon = getStatusIcon(booking.status);

  if (compact) {
    return (
      <div className="card hover:shadow-md transition-shadow duration-200">
        <div className="card-body p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                <FilmIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  {booking.equipment || booking.equipmentName}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {getStatusText(booking.status)}
              </span>
              {showActions && (
                <button
                  onClick={() => onView && onView(booking)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <FilmIcon className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {booking.equipment || booking.equipmentName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Booking #{booking.id}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {getStatusText(booking.status)}
            </span>
            {isOverdue(booking.endDate) && booking.status === 'active' && (
              <span className="status-badge status-damaged">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                Overdue
              </span>
            )}
          </div>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Date Range</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {calculateDuration(booking.startDate, booking.endDate)} day{calculateDuration(booking.startDate, booking.endDate) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {booking.startTime && booking.endTime && (
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">User</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {booking.user || booking.userName || 'Unknown'}
                </p>
              </div>
            </div>

            {booking.location && (
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {booking.location}
                  </p>
                </div>
              </div>
            )}

            {booking.purpose && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Purpose</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {booking.purpose}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-900 dark:text-white">
              {booking.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onView && onView(booking)}
                className="btn-outline btn-sm"
              >
                <EyeIcon className="w-4 h-4 mr-1" />
                View
              </button>
              {booking.status === 'pending' && (
                <button
                  onClick={() => onEdit && onEdit(booking)}
                  className="btn-outline btn-sm"
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {booking.status === 'active' && (
                <button
                  onClick={() => onCancel && onCancel(booking)}
                  className="btn-outline btn-sm text-warning-600 hover:text-warning-700 border-warning-300 hover:border-warning-400"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Cancel
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(booking)}
                  className="btn-outline btn-sm text-danger-600 hover:text-danger-700 border-danger-300 hover:border-danger-400"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick Links */}
        {booking.equipmentId && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <Link
                to={`/equipment/${booking.equipmentId}`}
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline"
              >
                View Equipment Details
              </Link>
              <Link
                to={`/bookings/${booking.id}`}
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline"
              >
                View Full Booking
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
