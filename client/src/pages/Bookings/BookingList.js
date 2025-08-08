import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  FilmIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { bookingService } from '../../services/bookingService';
import { equipmentService } from '../../services/equipmentService';
import { toast } from 'react-hot-toast';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list or calendar
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [bookingsResponse, equipmentResponse] = await Promise.all([
        bookingService.getBookings(),
        equipmentService.getEquipment()
      ]);

      if (bookingsResponse.success) {
        setBookings(bookingsResponse.data);
      }
      if (equipmentResponse.success) {
        setEquipment(equipmentResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load bookings');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const getStatusIcon = (status) => {
    const icons = {
      active: CheckCircleIcon,
      pending: ClockIcon,
      completed: CheckCircleIcon,
      cancelled: XCircleIcon
    };
    return icons[status] || ClockIcon;
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.equipment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesEquipment = equipmentFilter === 'all' || booking.equipmentId === equipmentFilter;
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && new Date(booking.startDate).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'week' && new Date(booking.startDate) >= new Date() && new Date(booking.startDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'month' && new Date(booking.startDate).getMonth() === new Date().getMonth());
    
    return matchesSearch && matchesStatus && matchesEquipment && matchesDate;
  });

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancelBooking(bookingId);
        toast.success('Booking cancelled successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to cancel booking');
      }
    }
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getBookingsForDate = (date) => {
    return filteredBookings.filter(booking => {
      const bookingDate = new Date(booking.startDate);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayBookings = getBookingsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`p-2 border border-gray-200 dark:border-gray-700 min-h-[100px] ${
            isToday ? 'bg-primary-50 dark:bg-primary-900' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${
              isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'
            }`}>
              {day}
            </span>
            {dayBookings.length > 0 && (
              <span className="text-xs bg-primary-500 text-white rounded-full px-2 py-1">
                {dayBookings.length}
              </span>
            )}
          </div>
          <div className="space-y-1">
            {dayBookings.slice(0, 2).map((booking) => (
              <div
                key={booking.id}
                className="text-xs p-1 rounded bg-gray-100 dark:bg-gray-700 truncate"
                title={`${booking.equipment} - ${booking.user}`}
              >
                {booking.equipment}
              </div>
            ))}
            {dayBookings.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{dayBookings.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage equipment bookings and reservations
          </p>
        </div>
        <Link
          to="/bookings/new"
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Equipment Filter */}
            <select
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Equipment</option>
              {equipment.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-lg transition-colors ${
                  view === 'list'
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`p-2 rounded-lg transition-colors ${
                  view === 'calendar'
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Calendar View
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-7 gap-1">
              {/* Calendar Header */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
              {/* Calendar Days */}
              {renderCalendar()}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="table-shelf">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-shelf-header">Equipment</th>
                <th className="table-shelf-header">User</th>
                <th className="table-shelf-header">Date Range</th>
                <th className="table-shelf-header">Status</th>
                <th className="table-shelf-header">Created</th>
                <th className="table-shelf-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const Icon = getStatusIcon(booking.status);
                return (
                  <tr key={booking.id} className="table-shelf-row">
                    <td className="table-shelf-cell">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <FilmIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {booking.equipment}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {booking.equipmentId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-shelf-cell">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{booking.user || 'Unknown User'}</span>
                      </div>
                    </td>
                    <td className="table-shelf-cell">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">
                            {new Date(booking.startDate).toLocaleDateString()}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            to {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-shelf-cell">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                    </td>
                    <td className="table-shelf-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="table-shelf-cell">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/bookings/${booking.id}`}
                          className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          to={`/bookings/${booking.id}/edit`}
                          className="p-1 text-gray-400 hover:text-warning-600 dark:hover:text-warning-400 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="p-1 text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 transition-colors"
                            title="Cancel"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredBookings.length === 0 && !loading && (
        <div className="text-center py-12">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No bookings found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all' || equipmentFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating your first booking.'}
          </p>
          {!searchTerm && statusFilter === 'all' && equipmentFilter === 'all' && dateFilter === 'all' && (
            <Link to="/bookings/new" className="btn-primary">
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Booking
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingList;
