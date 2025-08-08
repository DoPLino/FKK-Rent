import React, { useState, useMemo } from 'react';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  FilmIcon,
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const BookingCalendar = ({ 
  bookings = [], 
  onDateClick, 
  onBookingClick,
  selectedDate = null,
  view = 'month' // month, week, day
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      active: 'status-checked-out',
      pending: 'status-maintenance',
      completed: 'status-available',
      cancelled: 'status-damaged',
      overdue: 'status-damaged'
    };
    return statusClasses[status] || 'status-maintenance';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      active: CheckCircleIcon,
      pending: ClockIcon,
      completed: CheckCircleIcon,
      cancelled: XMarkIcon,
      overdue: ExclamationTriangleIcon
    };
    return statusIcons[status] || ClockIcon;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (date) => {
    return isSameDay(date, new Date());
  };

  const isSelected = (date) => {
    return selectedDate && isSameDay(date, selectedDate);
  };

  const getBookingsForDate = (date) => {
    return bookings.filter(booking => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedYear, selectedMonth + direction, 1);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  const handleDateClick = (date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  const handleBookingClick = (booking, event) => {
    event.stopPropagation();
    if (onBookingClick) {
      onBookingClick(booking);
    }
  };

  const calendarDays = useMemo(() => {
    const days = [];
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      days.push(date);
    }
    
    return days;
  }, [selectedYear, selectedMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Booking Calendar
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium text-gray-900 dark:text-white min-w-[120px] text-center">
              {monthNames[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="card-body p-0">
        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {dayNames.map(day => (
                <div
                  key={day}
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 bg-white dark:bg-gray-900">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-[120px] border-r border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    />
                  );
                }

                const dayBookings = getBookingsForDate(date);
                const isCurrentDay = isToday(date);
                const isSelectedDay = isSelected(date);

                return (
                  <div
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    className={`min-h-[120px] border-r border-b border-gray-200 dark:border-gray-700 p-2 cursor-pointer transition-colors ${
                      isCurrentDay 
                        ? 'bg-primary-50 dark:bg-primary-900' 
                        : isSelectedDay
                        ? 'bg-primary-100 dark:bg-primary-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {/* Date Number */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        isCurrentDay 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {date.getDate()}
                      </span>
                      {dayBookings.length > 0 && (
                        <span className="text-xs bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded-full">
                          {dayBookings.length}
                        </span>
                      )}
                    </div>

                    {/* Bookings */}
                    <div className="space-y-1">
                      {dayBookings.slice(0, 3).map((booking, bookingIndex) => {
                        const StatusIcon = getStatusIcon(booking.status);
                        const isStartDate = isSameDay(date, new Date(booking.startDate));
                        const isEndDate = isSameDay(date, new Date(booking.endDate));
                        
                        return (
                          <div
                            key={`${booking.id}-${bookingIndex}`}
                            onClick={(e) => handleBookingClick(booking, e)}
                            className={`p-1.5 rounded text-xs cursor-pointer transition-colors ${
                              isStartDate && isEndDate
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : isStartDate
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : isEndDate
                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            <div className="flex items-center space-x-1">
                              <StatusIcon className="w-3 h-3" />
                              <span className="truncate font-medium">
                                {booking.equipment || booking.equipmentName}
                              </span>
                            </div>
                            <div className="text-xs opacity-75 truncate">
                              {booking.user || booking.userName}
                            </div>
                          </div>
                        );
                      })}
                      
                      {dayBookings.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                          +{dayBookings.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 dark:bg-green-900 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Start Date</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-100 dark:bg-red-900 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">End Date</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Single Day</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Multi Day</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-4 h-4" />
              <span>Click date to view details</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
