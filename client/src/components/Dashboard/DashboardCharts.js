import React from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  FilmIcon,
  UserGroupIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const DashboardCharts = ({ 
  equipmentStats, 
  bookingStats, 
  userStats, 
  locationStats,
  monthlyTrends 
}) => {
  // Equipment Status Chart
  const EquipmentStatusChart = () => {
    if (!equipmentStats) return null;

    const { total, available, checkedOut, maintenance, damaged } = equipmentStats;
    const utilizationRate = total > 0 ? Math.round(((total - available) / total) * 100) : 0;

    const statusData = [
      { name: 'Available', value: available, color: 'bg-success-500', percentage: total > 0 ? Math.round((available / total) * 100) : 0 },
      { name: 'Checked Out', value: checkedOut, color: 'bg-warning-500', percentage: total > 0 ? Math.round((checkedOut / total) * 100) : 0 },
      { name: 'Maintenance', value: maintenance, color: 'bg-info-500', percentage: total > 0 ? Math.round((maintenance / total) * 100) : 0 },
      { name: 'Damaged', value: damaged, color: 'bg-danger-500', percentage: total > 0 ? Math.round((damaged / total) * 100) : 0 }
    ];

    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Equipment Status
            </h3>
            <div className="flex items-center space-x-2">
              <FilmIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {total} Total Items
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* Utilization Rate */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Utilization Rate
              </span>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                {utilizationRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${utilizationRate}%` }}
              ></div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="space-y-3">
            {statusData.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {status.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {status.value}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({status.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Booking Trends Chart
  const BookingTrendsChart = () => {
    if (!monthlyTrends || monthlyTrends.length === 0) return null;

    const maxValue = Math.max(...monthlyTrends.map(item => item.count));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Booking Trends
            </h3>
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last 12 Months
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="h-48 flex items-end justify-between space-x-1">
            {monthlyTrends.map((item, index) => {
              const height = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
              const monthName = months[item._id.month - 1] || item._id.month;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-sm relative">
                    <div 
                      className="bg-gradient-primary rounded-t-sm transition-all duration-300"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {monthName}
                  </span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Booking Status Chart
  const BookingStatusChart = () => {
    if (!bookingStats) return null;

    const { total, pending, approved, active, completed, cancelled } = bookingStats;
    const statusData = [
      { name: 'Pending', value: pending, color: 'bg-info-500', icon: '⏳' },
      { name: 'Approved', value: approved, color: 'bg-success-500', icon: '✅' },
      { name: 'Active', value: active, color: 'bg-warning-500', icon: '📅' },
      { name: 'Completed', value: completed, color: 'bg-primary-500', icon: '🎯' },
      { name: 'Cancelled', value: cancelled, color: 'bg-danger-500', icon: '❌' }
    ];

    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Booking Status
            </h3>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {total} Total Bookings
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-3">
            {statusData.map((status, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full ${status.color} flex items-center justify-center text-white text-sm`}>
                    {status.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {status.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {status.value}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {total > 0 ? Math.round((status.value / total) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // User Activity Chart
  const UserActivityChart = () => {
    if (!userStats) return null;

    const { total, active, new: newUsers } = userStats;
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              User Activity
            </h3>
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {total} Total Users
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* Active Users Rate */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Users
              </span>
              <span className="text-sm font-bold text-success-600 dark:text-success-400">
                {activeRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-success-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${activeRate}%` }}
              ></div>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {active}
              </div>
              <div className="text-xs text-primary-700 dark:text-primary-300">
                Active Users
              </div>
            </div>
            <div className="text-center p-3 bg-info-50 dark:bg-info-900 rounded-lg">
              <div className="text-2xl font-bold text-info-600 dark:text-info-400">
                {newUsers}
              </div>
              <div className="text-xs text-info-700 dark:text-info-300">
                New This Month
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Location Distribution Chart
  const LocationDistributionChart = () => {
    if (!locationStats || locationStats.length === 0) return null;

    const totalItems = locationStats.reduce((sum, location) => sum + location.count, 0);

    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Location Distribution
            </h3>
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {locationStats.length} Locations
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="space-y-3">
            {locationStats.slice(0, 5).map((location, index) => {
              const percentage = totalItems > 0 ? Math.round((location.count / totalItems) * 100) : 0;
              const colors = ['bg-primary-500', 'bg-success-500', 'bg-warning-500', 'bg-info-500', 'bg-danger-500'];
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {location._id || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {location.count}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <EquipmentStatusChart />
      <BookingTrendsChart />
      <BookingStatusChart />
      <UserActivityChart />
      <LocationDistributionChart />
    </div>
  );
};

export default DashboardCharts;
