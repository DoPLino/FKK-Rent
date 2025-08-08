import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CameraIcon, 
  MapPinIcon, 
  TagIcon,
  EyeIcon,
  PencilIcon,
  QrCodeIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  HeartIcon,
  ShareIcon,
  BookmarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const EquipmentCard = ({ 
  equipment, 
  onFavorite,
  onShare,
  onQuickBook,
  showActions = true,
  compact = false 
}) => {
  const [isFavorite, setIsFavorite] = useState(equipment.isFavorite || false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      available: 'status-available',
      booked: 'status-checked-out',
      'checked-out': 'status-checked-out',
      'in-custody': 'status-in-custody',
      maintenance: 'status-maintenance',
      damaged: 'status-damaged',
      lost: 'status-damaged'
    };
    return statusClasses[status] || 'status-available';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      available: 'Available',
      booked: 'Booked',
      'checked-out': 'Checked Out',
      'in-custody': 'In Custody',
      maintenance: 'Maintenance',
      damaged: 'Damaged',
      lost: 'Lost'
    };
    return statusTexts[status] || 'Available';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      available: CheckCircleIcon,
      booked: CalendarIcon,
      'checked-out': ClockIcon,
      'in-custody': ClockIcon,
      maintenance: WrenchScrewdriverIcon,
      damaged: ExclamationTriangleIcon,
      lost: ExclamationTriangleIcon
    };
    return statusIcons[status] || CheckCircleIcon;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'camera':
        return '📷';
      case 'lens':
        return '🔍';
      case 'lighting':
        return '💡';
      case 'audio':
        return '🎤';
      case 'tripod':
        return '📐';
      case 'grip':
        return '🔧';
      case 'monitor':
        return '📺';
      case 'computer':
        return '💻';
      case 'cable':
        return '🔌';
      case 'accessory':
        return '🎒';
      default:
        return '📦';
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (onFavorite) {
      onFavorite(equipment.id, !isFavorite);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: equipment.name,
        text: `Check out this equipment: ${equipment.name}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
    if (onShare) {
      onShare(equipment);
    }
  };

  const isOverdue = () => {
    if (equipment.dueDate) {
      return new Date(equipment.dueDate) < new Date();
    }
    return false;
  };

  const needsMaintenance = () => {
    return equipment.lastMaintenance && 
           new Date(equipment.lastMaintenance).getTime() + (30 * 24 * 60 * 60 * 1000) < new Date().getTime();
  };

  if (compact) {
    return (
      <div className="card hover:shadow-md transition-shadow duration-200 group">
        <div className="card-body p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">{getCategoryIcon(equipment.category)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                {equipment.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {equipment.brand} {equipment.model}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`status-badge ${getStatusBadgeClass(equipment.status)}`}>
                {getStatusText(equipment.status)}
              </span>
              {showActions && (
                <Link
                  to={`/equipment/${equipment.id || equipment._id}`}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <EyeIcon className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-lg transition-all duration-200 group relative">
      <div className="relative">
        {/* Equipment Image */}
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
          {equipment.image || (equipment.images && equipment.images.length > 0) ? (
            <img
              src={equipment.image || equipment.images[0].url}
              alt={equipment.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <CameraIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`status-badge ${getStatusBadgeClass(equipment.status)}`}>
            {(() => {
              const StatusIcon = getStatusIcon(equipment.status);
              return (
                <>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {getStatusText(equipment.status)}
                </>
              );
            })()}
          </span>
        </div>

        {/* Category Icon */}
        <div className="absolute top-2 left-2">
          <span className="text-2xl bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            {getCategoryIcon(equipment.category)}
          </span>
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full transition-colors ${
                isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-red-500'
              }`}
            >
              <HeartIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
            <Link
              to={`/equipment/${equipment.id || equipment._id}/qr`}
              className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors"
            >
              <QrCodeIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Warning Indicators */}
        {isOverdue() && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
            <span className="status-badge status-damaged">
              <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
              Overdue
            </span>
          </div>
        )}

        {needsMaintenance() && (
          <div className="absolute bottom-2 left-2">
            <span className="status-badge status-maintenance">
              <WrenchScrewdriverIcon className="w-3 h-3 mr-1" />
              Needs Maintenance
            </span>
          </div>
        )}
      </div>

      <div className="card-body">
        {/* Equipment Name */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
          {equipment.name}
        </h3>

        {/* Brand and Model */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {equipment.brand} {equipment.model}
        </p>

        {/* Serial Number */}
        {equipment.serialNumber && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 font-mono">
            SN: {equipment.serialNumber}
          </p>
        )}

        {/* Location */}
        {equipment.location && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{equipment.location}</span>
          </div>
        )}

        {/* Tags */}
        {equipment.tags && equipment.tags.length > 0 && (
          <div className="flex items-center mb-3">
            <TagIcon className="h-4 w-4 mr-1 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {equipment.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {equipment.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{equipment.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rental Rate */}
        {equipment.rentalRate && equipment.rentalRate.daily > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            <span className="font-medium text-primary-600 dark:text-primary-400">
              €{equipment.rentalRate.daily}
            </span>
            <span className="text-gray-500 dark:text-gray-500"> / day</span>
          </div>
        )}

        {/* Equipment Info */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
          {equipment.condition && (
            <div className="flex items-center">
              <InformationCircleIcon className="w-3 h-3 mr-1" />
              <span>Condition: {equipment.condition}</span>
            </div>
          )}
          {equipment.purchaseDate && (
            <div className="flex items-center">
              <CalendarIcon className="w-3 h-3 mr-1" />
              <span>Purchased: {new Date(equipment.purchaseDate).getFullYear()}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex space-x-2">
            <Link
              to={`/equipment/${equipment.id || equipment._id}`}
              className="btn-primary btn-sm flex-1 text-center"
            >
              <EyeIcon className="w-4 h-4 mr-1" />
              Details
            </Link>
            {equipment.status === 'available' && (
              <button
                onClick={() => onQuickBook && onQuickBook(equipment)}
                className="btn-success btn-sm flex-1"
              >
                <CalendarIcon className="w-4 h-4 mr-1" />
                Quick Book
              </button>
            )}
            {equipment.status !== 'available' && (
              <Link
                to={`/equipment/${equipment.id || equipment._id}/edit`}
                className="btn-outline btn-sm flex-1 text-center"
              >
                <PencilIcon className="w-4 h-4 mr-1" />
                Edit
              </Link>
            )}
          </div>
        )}

        {/* Quick Info Footer */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              {equipment.lastUsed && (
                <span>Last used: {new Date(equipment.lastUsed).toLocaleDateString()}</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <BookmarkIcon className="w-3 h-3" />
              <span>{equipment.bookingsCount || 0} bookings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
