import React from 'react';
import { 
  FilmIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const EquipmentStats = ({ equipment }) => {
  const stats = React.useMemo(() => {
    const total = equipment.length;
    const available = equipment.filter(item => item.status === 'available').length;
    const checkedOut = equipment.filter(item => item.status === 'checked-out').length;
    const maintenance = equipment.filter(item => item.status === 'maintenance').length;
    const damaged = equipment.filter(item => item.status === 'damaged').length;

    return {
      total,
      available,
      checkedOut,
      maintenance,
      damaged,
      utilizationRate: total > 0 ? Math.round(((total - available) / total) * 100) : 0
    };
  }, [equipment]);

  const statCards = [
    {
      title: 'Total Equipment',
      value: stats.total,
      icon: FilmIcon,
      color: 'primary',
      description: 'Total items in inventory'
    },
    {
      title: 'Available',
      value: stats.available,
      icon: CheckCircleIcon,
      color: 'success',
      description: 'Ready for booking'
    },
    {
      title: 'Checked Out',
      value: stats.checkedOut,
      icon: ExclamationTriangleIcon,
      color: 'warning',
      description: 'Currently in use'
    },
    {
      title: 'Maintenance',
      value: stats.maintenance,
      icon: WrenchScrewdriverIcon,
      color: 'info',
      description: 'Under maintenance'
    },
    {
      title: 'Damaged',
      value: stats.damaged,
      icon: XCircleIcon,
      color: 'danger',
      description: 'Needs repair'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      primary: {
        bg: 'bg-primary-50 dark:bg-primary-900',
        text: 'text-primary-600 dark:text-primary-400',
        icon: 'text-primary-500'
      },
      success: {
        bg: 'bg-success-50 dark:bg-success-900',
        text: 'text-success-600 dark:text-success-400',
        icon: 'text-success-500'
      },
      warning: {
        bg: 'bg-warning-50 dark:bg-warning-900',
        text: 'text-warning-600 dark:text-warning-400',
        icon: 'text-warning-500'
      },
      info: {
        bg: 'bg-info-50 dark:bg-info-900',
        text: 'text-info-600 dark:text-info-400',
        icon: 'text-info-500'
      },
      danger: {
        bg: 'bg-danger-50 dark:bg-danger-900',
        text: 'text-danger-600 dark:text-danger-400',
        icon: 'text-danger-500'
      }
    };
    return colorMap[color] || colorMap.primary;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color);
          
          return (
            <div key={stat.title} className="card">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold ${colors.text}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Utilization Rate */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Equipment Utilization
            </h3>
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {stats.utilizationRate}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.utilizationRate}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            {stats.utilizationRate}% of equipment is currently in use or unavailable
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800">
          <div className="card-body p-4">
            <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
              Quick Actions
            </h4>
            <div className="space-y-2">
              <button className="w-full btn-primary btn-sm">
                Add New Equipment
              </button>
              <button className="w-full btn-outline btn-sm">
                Export Inventory
              </button>
              <button className="w-full btn-outline btn-sm">
                Generate QR Codes
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900 dark:to-success-800">
          <div className="card-body p-4">
            <h4 className="font-semibold text-success-900 dark:text-success-100 mb-2">
              Maintenance
            </h4>
            <div className="space-y-2">
              <button className="w-full btn-success btn-sm">
                Schedule Maintenance
              </button>
              <button className="w-full btn-outline btn-sm">
                View Maintenance Log
              </button>
              <button className="w-full btn-outline btn-sm">
                Request Repairs
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-info-50 to-info-100 dark:from-info-900 dark:to-info-800">
          <div className="card-body p-4">
            <h4 className="font-semibold text-info-900 dark:text-info-100 mb-2">
              Reports
            </h4>
            <div className="space-y-2">
              <button className="w-full btn-info btn-sm">
                Usage Analytics
              </button>
              <button className="w-full btn-outline btn-sm">
                Equipment History
              </button>
              <button className="w-full btn-outline btn-sm">
                Cost Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentStats;
