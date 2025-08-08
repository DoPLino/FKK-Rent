import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FilmIcon, 
  CalendarIcon, 
  UserGroupIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  QrCodeIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  PlusIcon,
  WrenchScrewdriverIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { equipmentService } from '../../services/equipmentService';
import { bookingService } from '../../services/bookingService';
import { userService } from '../../services/userService';
import DashboardCharts from '../../components/Dashboard/DashboardCharts';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    equipment: { total: 0, available: 0, inUse: 0, maintenance: 0 },
    bookings: { total: 0, active: 0, upcoming: 0, overdue: 0 },
    users: { total: 0, active: 0, new: 0 },
    locations: { total: 0 }
  });
  const [chartData, setChartData] = useState({
    equipmentStats: null,
    bookingStats: null,
    userStats: null,
    locationStats: [],
    monthlyTrends: []
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentEquipment, setRecentEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [
        equipmentResponse,
        bookingResponse,
        userResponse,
        equipmentStatsResponse,
        bookingStatsResponse,
        userStatsResponse,
        locationStatsResponse,
        monthlyTrendsResponse
      ] = await Promise.all([
        equipmentService.getEquipment({ limit: 5 }),
        bookingService.getBookings({ limit: 5 }),
        userService.getUsers({ limit: 5 }),
        equipmentService.getEquipmentStats(),
        bookingService.getBookingStats(),
        userService.getUserStats(),
        equipmentService.getLocationStats(),
        bookingService.getMonthlyTrends()
      ]);

      // Set basic stats - Equipment
      if (equipmentResponse.success && Array.isArray(equipmentResponse.data)) {
        setStats(prev => ({
          ...prev,
          equipment: {
            total: equipmentResponse.data.length,
            available: equipmentResponse.data.filter(e => e.status === 'available').length,
            // Backend uses 'rented' (not 'checked-out')
            inUse: equipmentResponse.data.filter(e => e.status === 'rented').length,
            maintenance: equipmentResponse.data.filter(e => e.status === 'maintenance').length
          }
        }));
        setRecentEquipment(equipmentResponse.data);
      }

      // Set basic stats - Bookings
      if (bookingResponse.success && Array.isArray(bookingResponse.data)) {
        setStats(prev => ({
          ...prev,
          bookings: {
            total: bookingResponse.data.length,
            active: bookingResponse.data.filter(b => b.status === 'active').length,
            upcoming: bookingResponse.data.filter(b => b.status === 'pending').length,
            overdue: bookingResponse.data.filter(b => b.status === 'overdue').length
          }
        }));
        setRecentBookings(bookingResponse.data);
      }

      // Set basic stats - Users
      if (userResponse.success && Array.isArray(userResponse.data)) {
        setStats(prev => ({
          ...prev,
          users: {
            total: userResponse.data.length,
            // User model uses boolean isActive
            active: userResponse.data.filter(u => u.isActive === true).length,
            new: userResponse.data.filter(u => {
              const createdAt = new Date(u.createdAt);
              const oneMonthAgo = new Date();
              oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
              return createdAt > oneMonthAgo;
            }).length
          }
        }));
      }

      // Set chart data
      setChartData({
        equipmentStats: equipmentStatsResponse.success ? equipmentStatsResponse.data.overview : null,
        bookingStats: bookingStatsResponse.success ? bookingStatsResponse.data.overview : null,
        userStats: userStatsResponse.success ? userStatsResponse.data : null,
        locationStats: locationStatsResponse.success ? locationStatsResponse.data : [],
        monthlyTrends: monthlyTrendsResponse.success ? monthlyTrendsResponse.data : []
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-success-600 bg-success-100 dark:bg-success-900';
      case 'checked-out':
        return 'text-warning-600 bg-warning-100 dark:bg-warning-900';
      case 'maintenance':
        return 'text-info-600 bg-info-100 dark:bg-info-900';
      case 'damaged':
        return 'text-danger-600 bg-danger-100 dark:bg-danger-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success-600 bg-success-100 dark:bg-success-900';
      case 'pending':
        return 'text-warning-600 bg-warning-100 dark:bg-warning-900';
      case 'completed':
        return 'text-primary-600 bg-primary-100 dark:bg-primary-900';
      case 'cancelled':
        return 'text-danger-600 bg-danger-100 dark:bg-danger-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-16 h-16 text-danger-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Dashboard Error
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={loadDashboardData}
          className="btn-primary"
        >
          <ArrowUpIcon className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-primary rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-primary-100">
              Here's what's happening with your film equipment today
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/equipment/new" className="btn-white btn-sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Equipment
            </Link>
            <Link to="/bookings/new" className="btn-white btn-sm">
              <CalendarIcon className="w-4 h-4 mr-2" />
              New Booking
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Equipment Stats */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Equipment
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.equipment.total}
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <FilmIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-success-600 dark:text-success-400">
                  {stats.equipment.available} available
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-warning-600 dark:text-warning-400">
                  {stats.equipment.inUse} in use
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Stats */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.bookings.active}
                </p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-info-600 dark:text-info-400">
                  {stats.bookings.upcoming} pending
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-danger-600 dark:text-danger-400">
                  {stats.bookings.overdue} overdue
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Stats */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.users.active}
                </p>
              </div>
              <div className="p-3 bg-info-100 dark:bg-info-900 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-info-600 dark:text-info-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-success-600 dark:text-success-400">
                  {stats.users.new} new this month
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Locations Stats */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Locations
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.locations.total}
                </p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <MapPinIcon className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Across all locations
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Analytics & Insights
          </h2>
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Real-time data
            </span>
          </div>
        </div>
        
        <DashboardCharts 
          equipmentStats={chartData.equipmentStats}
          bookingStats={chartData.bookingStats}
          userStats={chartData.userStats}
          locationStats={chartData.locationStats}
          monthlyTrends={chartData.monthlyTrends}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Bookings
              </h3>
              <Link to="/bookings" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                View all
              </Link>
            </div>
          </div>
          <div className="card-body">
            {recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <FilmIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {booking.equipment?.name || 'Unknown Equipment'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBookingStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No recent bookings</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Equipment */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Equipment
              </h3>
              <Link to="/equipment" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                View all
              </Link>
            </div>
          </div>
          <div className="card-body">
            {recentEquipment.length > 0 ? (
              <div className="space-y-3">
                {recentEquipment.map((equipment) => (
                  <div key={equipment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <FilmIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {equipment.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {equipment.category} • {equipment.location}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(equipment.status)}`}>
                      {equipment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FilmIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No equipment found</p>
              </div>
            )}
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
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/equipment/new" className="btn-primary w-full">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Equipment
            </Link>
            <Link to="/bookings/new" className="btn-success w-full">
              <CalendarIcon className="w-4 h-4 mr-2" />
              New Booking
            </Link>
            <Link to="/qr-scanner" className="btn-warning w-full">
              <QrCodeIcon className="w-4 h-4 mr-2" />
              Scan QR Code
            </Link>
            <Link to="/settings" className="btn-outline w-full">
              <CogIcon className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;