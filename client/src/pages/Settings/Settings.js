import React, { useState } from 'react';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  CogIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Settings = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reminders: true,
    updates: false
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
              </div>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    defaultValue={user?.firstName || ''}
                    className="form-input"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    defaultValue={user?.lastName || ''}
                    className="form-input"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  className="form-input"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="form-label">Role</label>
                <input
                  type="text"
                  defaultValue={user?.role || ''}
                  className="form-input bg-gray-50 dark:bg-gray-700"
                  disabled
                />
              </div>
              <div className="flex justify-end">
                <button className="btn-primary">
                  Update Profile
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <BellIcon className="w-5 h-5 mr-2 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notification Preferences
                </h2>
              </div>
            </div>
            <div className="card-body space-y-4">
              <div className="space-y-3">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {key} Notifications
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive notifications about {key}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Appearance */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <CogIcon className="w-5 h-5 mr-2 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Appearance
                </h2>
              </div>
            </div>
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isDarkMode ? (
                    <MoonIcon className="w-5 h-5 mr-2 text-primary-500" />
                  ) : (
                    <SunIcon className="w-5 h-5 mr-2 text-primary-500" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDarkMode ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <ShieldCheckIcon className="w-5 h-5 mr-2 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Security
                </h2>
              </div>
            </div>
            <div className="card-body space-y-3">
              <button className="w-full btn-outline text-left">
                Change Password
              </button>
              <button className="w-full btn-outline text-left">
                Two-Factor Authentication
              </button>
              <button className="w-full btn-outline text-left text-danger-600 dark:text-danger-400">
                Delete Account
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account Stats
              </h2>
            </div>
            <div className="card-body space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Member since
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total bookings
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  24
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Active bookings
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  3
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
