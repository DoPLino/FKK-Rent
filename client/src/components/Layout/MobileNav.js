import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  FilmIcon, 
  CalendarIcon, 
  QrCodeIcon, 
  UserIcon,
  PlusIcon,
  BellIcon,
  CogIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const MobileNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Mock notifications count
  const unreadNotifications = 3;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Equipment', href: '/equipment', icon: FilmIcon },
    { name: 'Bookings', href: '/bookings', icon: CalendarIcon },
    { name: 'Scanner', href: '/qr-scanner', icon: QrCodeIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const quickActions = [
    { name: 'Add Equipment', href: '/equipment/new', icon: PlusIcon, color: 'primary' },
    { name: 'New Booking', href: '/bookings/new', icon: CalendarIcon, color: 'success' },
    { name: 'Quick Scan', href: '/qr-scanner', icon: QrCodeIcon, color: 'warning' },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon, color: 'info' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary-500 hover:bg-primary-600 text-white',
      success: 'bg-success-500 hover:bg-success-600 text-white',
      warning: 'bg-warning-500 hover:bg-warning-600 text-white',
      info: 'bg-info-500 hover:bg-info-600 text-white',
    };
    return colorMap[color] || colorMap.primary;
  };

  return (
    <>
      {/* Quick Actions Overlay */}
      {showQuickActions && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowQuickActions(false)}
        />
      )}

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="lg:hidden fixed bottom-20 left-4 right-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.name}
                    to={action.href}
                    onClick={() => setShowQuickActions(false)}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${getColorClasses(action.color)}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{action.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <nav className="flex items-center justify-around px-2 py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}

          {/* Quick Actions Button */}
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
              showQuickActions
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="relative">
              <PlusIcon className="w-6 h-6 mb-1" />
              {showQuickActions && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <span className="text-xs font-medium">Quick</span>
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="flex flex-col items-center px-3 py-2 rounded-lg transition-colors duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <div className="relative">
              <BellIcon className="w-6 h-6 mb-1" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
              )}
            </div>
            <span className="text-xs font-medium">Alerts</span>
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
              isActive('/settings')
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <CogIcon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </nav>

        {/* Status Bar */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span>Connected</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="capitalize">{user.role}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <ExclamationTriangleIcon className="w-3 h-3" />
                <span>{unreadNotifications} alerts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
