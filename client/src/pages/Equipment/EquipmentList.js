import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  QrCodeIcon,
  MapPinIcon,
  CalendarIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import { equipmentService } from '../../services/equipmentService';
import { toast } from 'react-hot-toast';
import EquipmentStats from '../../components/Equipment/EquipmentStats';

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // table or grid

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getEquipment();
      if (response.success) {
        setEquipment(response.data);
      }
    } catch (error) {
      toast.error('Failed to load equipment');
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      available: 'status-available',
      'checked-out': 'status-checked-out',
      'in-custody': 'status-in-custody',
      maintenance: 'status-maintenance',
      damaged: 'status-damaged'
    };
    return statusClasses[status] || 'status-maintenance';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      available: 'Available',
      'checked-out': 'Checked Out',
      'in-custody': 'In Custody',
      maintenance: 'Maintenance',
      damaged: 'Damaged'
    };
    return statusTexts[status] || status;
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await equipmentService.deleteEquipment(id);
        toast.success('Equipment deleted successfully');
        loadEquipment();
      } catch (error) {
        toast.error('Failed to delete equipment');
      }
    }
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
            Equipment
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your film equipment inventory
          </p>
        </div>
        <Link
          to="/equipment/new"
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Equipment
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search equipment..."
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
              <option value="available">Available</option>
              <option value="checked-out">Checked Out</option>
              <option value="in-custody">In Custody</option>
              <option value="maintenance">Maintenance</option>
              <option value="damaged">Damaged</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Categories</option>
              <option value="camera">Camera</option>
              <option value="lens">Lens</option>
              <option value="lighting">Lighting</option>
              <option value="audio">Audio</option>
              <option value="tripod">Tripod</option>
              <option value="accessories">Accessories</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Statistics */}
      <EquipmentStats equipment={equipment} />

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredEquipment.length} equipment found
        </p>
      </div>

      {/* Equipment Table */}
      {viewMode === 'table' && (
        <div className="table-shelf">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-shelf-header">Equipment</th>
                <th className="table-shelf-header">Serial Number</th>
                <th className="table-shelf-header">Location</th>
                <th className="table-shelf-header">Status</th>
                <th className="table-shelf-header">Category</th>
                <th className="table-shelf-header">Last Updated</th>
                <th className="table-shelf-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.map((item) => (
                <tr key={item.id} className="table-shelf-row">
                  <td className="table-shelf-cell">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <FilmIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description?.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-shelf-cell">
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      {item.serialNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="table-shelf-cell">
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{item.location || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="table-shelf-cell">
                    <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td className="table-shelf-cell">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {item.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="table-shelf-cell">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="table-shelf-cell">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/equipment/${item.id}`}
                        className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/equipment/${item.id}/edit`}
                        className="p-1 text-gray-400 hover:text-warning-600 dark:hover:text-warning-400 transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-info-600 dark:hover:text-info-400 transition-colors"
                        title="QR Code"
                      >
                        <QrCodeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Equipment Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEquipment.map((item) => (
            <div key={item.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body p-4">
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <FilmIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {item.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {item.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="truncate">{item.location || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex space-x-1">
                      <Link
                        to={`/equipment/${item.id}`}
                        className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/equipment/${item.id}/edit`}
                        className="p-1 text-gray-400 hover:text-warning-600 dark:hover:text-warning-400"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-gray-400 hover:text-danger-600 dark:hover:text-danger-400"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredEquipment.length === 0 && !loading && (
        <div className="text-center py-12">
          <FilmIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No equipment found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by adding your first piece of equipment.'}
          </p>
          {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
            <Link to="/equipment/new" className="btn-primary">
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Equipment
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
