import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  FilmIcon,
  MapPinIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const FilterModal = ({ 
  isOpen, 
  onClose, 
  filters = {}, 
  onApply, 
  filterOptions = {},
  title = "Filter Options"
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMultiSelectChange = (key, value, checked) => {
    setLocalFilters(prev => {
      const currentValues = prev[key] || [];
      if (checked) {
        return {
          ...prev,
          [key]: [...currentValues, value]
        };
      } else {
        return {
          ...prev,
          [key]: currentValues.filter(v => v !== value)
        };
      }
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  const handleClose = () => {
    setLocalFilters(filters);
    onClose();
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return value !== '' && value !== null && value !== undefined;
    }).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FunnelIcon className="w-6 h-6 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
                {getActiveFilterCount() > 0 && (
                  <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-medium px-2 py-1 rounded-full">
                    {getActiveFilterCount()} active
                  </span>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'general', name: 'General', icon: MagnifyingGlassIcon },
                { id: 'dates', name: 'Dates', icon: CalendarIcon },
                { id: 'equipment', name: 'Equipment', icon: FilmIcon },
                { id: 'users', name: 'Users', icon: UserIcon },
                { id: 'locations', name: 'Locations', icon: MapPinIcon }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="card-body max-h-96 overflow-y-auto">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="form-label">Search Term</label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={localFilters.searchTerm || ''}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      className="form-input pl-10"
                      placeholder="Search equipment, users, notes..."
                    />
                  </div>
                </div>

                {/* Status Filter */}
                {filterOptions.statuses && (
                  <div>
                    <label className="form-label">Status</label>
                    <div className="space-y-2">
                      {filterOptions.statuses.map(status => (
                        <label key={status.value} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={(localFilters.statuses || []).includes(status.value)}
                            onChange={(e) => handleMultiSelectChange('statuses', status.value, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {status.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority Filter */}
                {filterOptions.priorities && (
                  <div>
                    <label className="form-label">Priority</label>
                    <div className="space-y-2">
                      {filterOptions.priorities.map(priority => (
                        <label key={priority.value} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={(localFilters.priorities || []).includes(priority.value)}
                            onChange={(e) => handleMultiSelectChange('priorities', priority.value, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {priority.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dates Tab */}
            {activeTab === 'dates' && (
              <div className="space-y-6">
                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      value={localFilters.startDate || ''}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      value={localFilters.endDate || ''}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Quick Date Filters */}
                <div>
                  <label className="form-label">Quick Filters</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Today', value: 'today' },
                      { label: 'This Week', value: 'thisWeek' },
                      { label: 'This Month', value: 'thisMonth' },
                      { label: 'Next 7 Days', value: 'next7Days' },
                      { label: 'Next 30 Days', value: 'next30Days' },
                      { label: 'Overdue', value: 'overdue' }
                    ].map(quickFilter => (
                      <button
                        key={quickFilter.value}
                        onClick={() => handleFilterChange('quickDate', quickFilter.value)}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          localFilters.quickDate === quickFilter.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {quickFilter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Equipment Tab */}
            {activeTab === 'equipment' && (
              <div className="space-y-6">
                {/* Equipment Categories */}
                {filterOptions.categories && (
                  <div>
                    <label className="form-label">Equipment Categories</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {filterOptions.categories.map(category => (
                        <label key={category.value} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={(localFilters.categories || []).includes(category.value)}
                            onChange={(e) => handleMultiSelectChange('categories', category.value, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {category.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equipment Status */}
                {filterOptions.equipmentStatuses && (
                  <div>
                    <label className="form-label">Equipment Status</label>
                    <div className="space-y-2">
                      {filterOptions.equipmentStatuses.map(status => (
                        <label key={status.value} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={(localFilters.equipmentStatuses || []).includes(status.value)}
                            onChange={(e) => handleMultiSelectChange('equipmentStatuses', status.value, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {status.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* User Search */}
                <div>
                  <label className="form-label">Search Users</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={localFilters.userSearch || ''}
                      onChange={(e) => handleFilterChange('userSearch', e.target.value)}
                      className="form-input pl-10"
                      placeholder="Search by name or email..."
                    />
                  </div>
                </div>

                {/* User Roles */}
                {filterOptions.userRoles && (
                  <div>
                    <label className="form-label">User Roles</label>
                    <div className="space-y-2">
                      {filterOptions.userRoles.map(role => (
                        <label key={role.value} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={(localFilters.userRoles || []).includes(role.value)}
                            onChange={(e) => handleMultiSelectChange('userRoles', role.value, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {role.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Departments */}
                {filterOptions.departments && (
                  <div>
                    <label className="form-label">Departments</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {filterOptions.departments.map(dept => (
                        <label key={dept.value} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={(localFilters.departments || []).includes(dept.value)}
                            onChange={(e) => handleMultiSelectChange('departments', dept.value, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {dept.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Locations Tab */}
            {activeTab === 'locations' && (
              <div className="space-y-6">
                {/* Location Search */}
                <div>
                  <label className="form-label">Search Locations</label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={localFilters.locationSearch || ''}
                      onChange={(e) => handleFilterChange('locationSearch', e.target.value)}
                      className="form-input pl-10"
                      placeholder="Search locations..."
                    />
                  </div>
                </div>

                {/* Location Types */}
                {filterOptions.locationTypes && (
                  <div>
                    <label className="form-label">Location Types</label>
                    <div className="space-y-2">
                      {filterOptions.locationTypes.map(type => (
                        <label key={type.value} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={(localFilters.locationTypes || []).includes(type.value)}
                            onChange={(e) => handleMultiSelectChange('locationTypes', type.value, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {type.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="card-footer">
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="btn-outline"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Reset All
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleClose}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="btn-primary"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
