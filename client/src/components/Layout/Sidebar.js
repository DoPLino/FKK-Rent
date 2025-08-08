import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  FilmIcon, 
  CalendarIcon, 
  QrCodeIcon, 
  UserIcon, 
  CogIcon,
  SunIcon,
  MoonIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BellIcon,
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [collapsedSections, setCollapsedSections] = useState({});
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Mock data for notifications and stats
  const unreadNotifications = 3;
  const pendingApprovals = 2;
  const overdueItems = 1;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Equipment', href: '/equipment', icon: FilmIcon },
    { name: 'Bookings', href: '/bookings', icon: CalendarIcon },
    { name: 'QR Scanner', href: '/qr-scanner', icon: QrCodeIcon },
    { name: 'KI-Dashboard', href: '/ai-dashboard', icon: SparklesIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const adminNavigation = [
    { name: 'Users', href: '/users', icon: UserGroupIcon },
    { name: 'Locations', href: '/locations', icon: MapPinIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];

  const quickActions = [
    { name: 'Add Equipment', href: '/equipment/new', icon: PlusIcon },
    { name: 'New Booking', href: '/bookings/new', icon: CalendarIcon },
    { name: 'Scan QR Code', href: '/qr-scanner', icon: QrCodeIcon },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = () => {
    logout();
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="sidebar-shelf flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <FilmIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              FilmEquipment
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Management System
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          {unreadNotifications > 0 && (
            <div className="flex items-center justify-between p-2 bg-warning-50 dark:bg-warning-900 rounded-lg">
              <div className="flex items-center space-x-2">
                <BellIcon className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                <span className="text-xs text-warning-700 dark:text-warning-300">
                  {unreadNotifications} notifications
                </span>
              </div>
            </div>
          )}
          
          {pendingApprovals > 0 && (
            <div className="flex items-center justify-between p-2 bg-info-50 dark:bg-info-900 rounded-lg">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-info-600 dark:text-info-400" />
                <span className="text-xs text-info-700 dark:text-info-300">
                  {pendingApprovals} pending approvals
                </span>
              </div>
            </div>
          )}

          {overdueItems > 0 && (
            <div className="flex items-center justify-between p-2 bg-danger-50 dark:bg-danger-900 rounded-lg">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-danger-600 dark:text-danger-400" />
                <span className="text-xs text-danger-700 dark:text-danger-300">
                  {overdueItems} overdue items
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="sidebar-item w-full justify-between"
        >
          <div className="flex items-center">
            <PlusIcon className="w-5 h-5 mr-3" />
            Quick Actions
          </div>
          {showQuickActions ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>
        
        {showQuickActions && (
          <div className="mt-2 space-y-1">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {action.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`sidebar-item ${
                  isActive(item.href) ? 'sidebar-item-active' : ''
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleSection('admin')}
              className="sidebar-item w-full justify-between"
            >
              <div className="flex items-center">
                <CogIcon className="w-5 h-5 mr-3" />
                Administration
              </div>
              {collapsedSections.admin ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
            
            {!collapsedSections.admin && (
              <div className="mt-2 space-y-1">
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                        isActive(item.href)
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User Profile & Settings */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="sidebar-item w-full justify-between"
        >
          <div className="flex items-center">
            {isDarkMode ? (
              <SunIcon className="w-5 h-5 mr-3" />
            ) : (
              <MoonIcon className="w-5 h-5 mr-3" />
            )}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </div>
        </button>

        {/* Settings */}
        <Link to="/settings" className="sidebar-item">
          <CogIcon className="w-5 h-5 mr-3" />
          Settings
        </Link>

        {/* User Info */}
        {user && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-primary-600 dark:text-primary-400 capitalize">
                    {user.role}
                  </span>
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">System Status</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-success-600 dark:text-success-400">Online</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
