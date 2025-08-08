import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  BellIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  HomeIcon,
  FilmIcon,
  CalendarIcon,
  QrCodeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Header = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'New booking request',
      message: 'Sony FX3 camera requested for tomorrow',
      time: '2 minutes ago',
      read: false,
      icon: CalendarIcon
    },
    {
      id: 2,
      type: 'equipment',
      title: 'Equipment overdue',
      message: 'Canon 24-70mm lens is overdue',
      time: '1 hour ago',
      read: false,
      icon: ExclamationTriangleIcon
    },
    {
      id: 3,
      type: 'maintenance',
      title: 'Maintenance completed',
      message: 'Arri Alexa maintenance finished',
      time: '3 hours ago',
      read: true,
      icon: CheckCircleIcon
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 0) return [{ name: 'Dashboard', href: '/dashboard', icon: HomeIcon }];
    
    const breadcrumbMap = {
      dashboard: { name: 'Dashboard', icon: HomeIcon },
      equipment: { name: 'Equipment', icon: FilmIcon },
      bookings: { name: 'Bookings', icon: CalendarIcon },
      'qr-scanner': { name: 'QR Scanner', icon: QrCodeIcon },
      profile: { name: 'Profile', icon: UserIcon },
      settings: { name: 'Settings', icon: CogIcon }
    };
    
    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const breadcrumb = breadcrumbMap[segment] || { 
        name: segment.charAt(0).toUpperCase() + segment.slice(1), 
        icon: null 
      };
      return { ...breadcrumb, href };
    });
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => {
      const mockResults = [
        { type: 'equipment', id: '1', name: 'Sony FX3 Camera', category: 'Camera' },
        { type: 'equipment', id: '2', name: 'Canon 24-70mm Lens', category: 'Lens' },
        { type: 'booking', id: '3', name: 'Booking #123', user: 'Max Mustermann' },
        { type: 'user', id: '4', name: 'Max Mustermann', email: 'max@example.com' }
      ].filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category?.toLowerCase().includes(query.toLowerCase()) ||
        item.user?.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 300);
  };

  const handleSearchResultClick = (result) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
    
    switch (result.type) {
      case 'equipment':
        navigate(`/equipment/${result.id}`);
        break;
      case 'booking':
        navigate(`/bookings/${result.id}`);
        break;
      case 'user':
        navigate(`/profile/${result.id}`);
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const markNotificationAsRead = (notificationId) => {
    // In a real app, this would update the backend
    console.log('Marking notification as read:', notificationId);
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-4 lg:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden lg:flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const Icon = crumb.icon;
            return (
              <div key={crumb.href} className="flex items-center">
                {index > 0 && (
                  <ChevronDownIcon className="w-4 h-4 text-gray-400 mx-2 rotate-[-90deg]" />
                )}
                <Link
                  to={crumb.href}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
                    index === breadcrumbs.length - 1
                      ? 'text-gray-900 dark:text-white font-medium bg-gray-100 dark:bg-gray-700'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{crumb.name}</span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Search dropdown */}
            {showSearch && (
              <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search equipment, bookings, users..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>
                
                {isSearching && (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                            {result.type === 'equipment' && <FilmIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                            {result.type === 'booking' && <CalendarIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                            {result.type === 'user' && <UserIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {result.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {result.category || result.user || result.email}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchQuery && !isSearching && searchResults.length === 0 && (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {unreadCount} unread
                    </p>
                  )}
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationAsRead(notification.id)}
                        className={`p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            notification.type === 'booking' ? 'bg-blue-100 dark:bg-blue-900' :
                            notification.type === 'equipment' ? 'bg-warning-100 dark:bg-warning-900' :
                            'bg-success-100 dark:bg-success-900'
                          }`}>
                            <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/notifications"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
                
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <CogIcon className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
