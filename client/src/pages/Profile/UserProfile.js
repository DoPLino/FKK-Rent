import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  FilmIcon,
  CogIcon,
  PencilIcon,
  ShieldCheckIcon,
  BellIcon,
  KeyIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { bookingService } from '../../services/bookingService';
import { toast } from 'react-hot-toast';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    bio: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [profileResponse, bookingsResponse] = await Promise.all([
        userService.getProfile(),
        bookingService.getUserBookings()
      ]);

      if (profileResponse.success) {
        setProfile(profileResponse.data);
        setFormData({
          firstName: profileResponse.data.firstName || '',
          lastName: profileResponse.data.lastName || '',
          email: profileResponse.data.email || '',
          phone: profileResponse.data.phone || '',
          department: profileResponse.data.department || '',
          position: profileResponse.data.position || '',
          bio: profileResponse.data.bio || ''
        });
      }

      if (bookingsResponse.success) {
        setUserBookings(bookingsResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load user data');
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      const response = await userService.updateProfile(formData);
      if (response.success) {
        setProfile(response.data);
        updateUser(response.data);
        setEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      active: 'status-checked-out',
      pending: 'status-maintenance',
      completed: 'status-available',
      cancelled: 'status-damaged'
    };
    return statusClasses[status] || 'status-maintenance';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      active: 'Active',
      pending: 'Pending',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return statusTexts[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/settings" className="btn-outline">
            <CogIcon className="w-4 h-4 mr-2" />
            Settings
          </Link>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="btn-primary"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
            </div>
            <div className="card-body">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="form-label">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`form-input ${errors.firstName ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                      />
                      {errors.firstName && <p className="form-error">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="form-label">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`form-input ${errors.lastName ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                      />
                      {errors.lastName && <p className="form-error">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input ${errors.email ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                    />
                    {errors.email && <p className="form-error">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="form-label">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="department" className="form-label">
                        Department
                      </label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="position" className="form-label">
                      Position
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="form-label">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button type="submit" className="btn-primary">
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setErrors({});
                        setFormData({
                          firstName: profile?.firstName || '',
                          lastName: profile?.lastName || '',
                          email: profile?.email || '',
                          phone: profile?.phone || '',
                          department: profile?.department || '',
                          position: profile?.position || '',
                          bio: profile?.bio || ''
                        });
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">First Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profile?.firstName || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profile?.lastName || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {profile?.email || 'Not provided'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profile?.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profile?.department || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Position</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {profile?.position || 'Not provided'}
                    </p>
                  </div>

                  {profile?.bio && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Bio</p>
                      <p className="text-gray-900 dark:text-white">
                        {profile.bio}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Bookings
                </h2>
                <Link to="/bookings" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  View all
                </Link>
              </div>
            </div>
            <div className="card-body">
              {userBookings.length > 0 ? (
                <div className="space-y-3">
                  {userBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                          <FilmIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {booking.equipment}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Avatar */}
          <div className="card">
            <div className="card-body text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-12 h-12 text-white" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
                  <CameraIcon className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {profile?.firstName} {profile?.lastName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 capitalize">
                {user?.role || 'User'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Account Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account Stats
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {userBookings.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-success-50 dark:bg-success-900 rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Bookings</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {userBookings.filter(b => b.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-warning-50 dark:bg-warning-900 rounded-lg">
                    <ClockIcon className="w-5 h-5 text-warning-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {userBookings.filter(b => b.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h3>
            </div>
            <div className="card-body space-y-3">
              <Link to="/bookings/new" className="btn-primary w-full">
                <CalendarIcon className="w-4 h-4 mr-2" />
                New Booking
              </Link>
              <Link to="/settings" className="btn-outline w-full text-center">
                <CogIcon className="w-4 h-4 mr-2" />
                Settings
              </Link>
              <button className="btn-outline w-full">
                <KeyIcon className="w-4 h-4 mr-2" />
                Change Password
              </button>
              <button className="btn-outline w-full">
                <BellIcon className="w-4 h-4 mr-2" />
                Notifications
              </button>
            </div>
          </div>

          {/* Account Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account Status
              </h3>
            </div>
            <div className="card-body space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Email Verified</span>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500" />
                  <span className="text-sm text-success-600 dark:text-success-400">Verified</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Account Status</span>
                <span className="status-badge status-available">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Login</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
