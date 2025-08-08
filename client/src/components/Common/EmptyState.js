import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FilmIcon,
  CalendarIcon,
  UserIcon,
  QrCodeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const EmptyState = ({ 
  type = 'default',
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  action = null,
  icon = null,
  size = 'medium'
}) => {
  const iconMap = {
    equipment: FilmIcon,
    bookings: CalendarIcon,
    users: UserIcon,
    scanner: QrCodeIcon,
    search: MagnifyingGlassIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
    default: InformationCircleIcon
  };

  const Icon = icon || iconMap[type] || iconMap.default;

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const renderAction = () => {
    if (!action) return null;

    if (action.type === 'link') {
      return (
        <Link
          to={action.href}
          className="btn-primary inline-flex items-center"
        >
          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
          {action.text}
        </Link>
      );
    }

    if (action.type === 'button') {
      return (
        <button
          onClick={action.onClick}
          className="btn-primary inline-flex items-center"
        >
          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
          {action.text}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="text-center py-12 px-4">
      <div className="flex flex-col items-center space-y-4">
        {/* Icon */}
        <div className={`${sizeClasses[size]} text-gray-400 dark:text-gray-500`}>
          <Icon className="w-full h-full" />
        </div>

        {/* Content */}
        <div className="max-w-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {description}
          </p>

          {/* Action */}
          {renderAction()}
        </div>
      </div>
    </div>
  );
};

// Predefined empty states
export const EquipmentEmptyState = ({ action }) => (
  <EmptyState
    type="equipment"
    title="No equipment found"
    description="Get started by adding your first piece of equipment to the inventory."
    action={action || {
      type: 'link',
      href: '/equipment/new',
      text: 'Add Equipment',
      icon: PlusIcon
    }}
  />
);

export const BookingsEmptyState = ({ action }) => (
  <EmptyState
    type="bookings"
    title="No bookings found"
    description="Create your first booking to start managing equipment reservations."
    action={action || {
      type: 'link',
      href: '/bookings/new',
      text: 'Create Booking',
      icon: PlusIcon
    }}
  />
);

export const SearchEmptyState = ({ searchTerm }) => (
  <EmptyState
    type="search"
    title="No results found"
    description={`No items found matching "${searchTerm}". Try adjusting your search terms or filters.`}
    action={{
      type: 'button',
      text: 'Clear Search',
      onClick: () => window.location.reload()
    }}
  />
);

export const UsersEmptyState = ({ action }) => (
  <EmptyState
    type="users"
    title="No users found"
    description="Start building your team by adding users to the system."
    action={action || {
      type: 'link',
      href: '/users/new',
      text: 'Add User',
      icon: PlusIcon
    }}
  />
);

export default EmptyState;
