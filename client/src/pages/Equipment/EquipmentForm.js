import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  CameraIcon,
  PlusIcon,
  XMarkIcon,
  MapPinIcon,
  TagIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { equipmentService } from '../../services/equipmentService';
import { toast } from 'react-hot-toast';

const EquipmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    serialNumber: '',
    location: '',
    status: 'available',
    condition: 'excellent',
    value: '',
    image: '',
    qrCode: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (isEditing) {
      loadEquipment();
    }
  }, [id]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getEquipmentById(id);
      if (response.success) {
        setFormData(response.data);
        if (response.data.image) {
          setImagePreview(response.data.image);
        }
      } else {
        toast.error('Equipment not found');
        navigate('/equipment');
      }
    } catch (error) {
      toast.error('Failed to load equipment');
      navigate('/equipment');
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Equipment name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    
    if (formData.value && isNaN(formData.value)) {
      newErrors.value = 'Value must be a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      let imageUrl = formData.image;
      
      // Upload image if new file selected
      if (imageFile) {
        const uploadResponse = await equipmentService.uploadImage(imageFile);
        if (uploadResponse.success) {
          imageUrl = uploadResponse.data.url;
        }
      }

      const equipmentData = {
        ...formData,
        image: imageUrl
      };

      let response;
      if (isEditing) {
        response = await equipmentService.updateEquipment(id, equipmentData);
      } else {
        response = await equipmentService.createEquipment(equipmentData);
      }

      if (response.success) {
        toast.success(isEditing ? 'Equipment updated successfully' : 'Equipment created successfully');
        navigate(`/equipment/${response.data.id || id}`);
      } else {
        toast.error(response.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Failed to save equipment');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'camera', label: 'Camera' },
    { value: 'lens', label: 'Lens' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'audio', label: 'Audio' },
    { value: 'tripod', label: 'Tripod' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'monitor', label: 'Monitor' },
    { value: 'grip', label: 'Grip' }
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const locations = [
    { value: 'main-storage', label: 'Main Storage' },
    { value: 'studio-a', label: 'Studio A' },
    { value: 'studio-b', label: 'Studio B' },
    { value: 'field-kit', label: 'Field Kit' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  if (loading && isEditing) {
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
        <div className="flex items-center space-x-4">
          <Link
            to="/equipment"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Equipment' : 'Add New Equipment'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditing ? 'Update equipment information' : 'Create a new equipment entry'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Basic Information
                </h2>
              </div>
              <div className="card-body space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="form-label">
                    Equipment Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                    placeholder="Enter equipment name"
                  />
                  {errors.name && <p className="form-error">{errors.name}</p>}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter equipment description"
                  />
                </div>

                {/* Category and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="form-label">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`form-input ${errors.category ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && <p className="form-error">{errors.category}</p>}
                  </div>

                  <div>
                    <label htmlFor="location" className="form-label">
                      Location *
                    </label>
                    <select
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`form-input ${errors.location ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                    >
                      <option value="">Select location</option>
                      {locations.map(location => (
                        <option key={location.value} value={location.value}>
                          {location.label}
                        </option>
                      ))}
                    </select>
                    {errors.location && <p className="form-error">{errors.location}</p>}
                  </div>
                </div>

                {/* Serial Number and Condition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="serialNumber" className="form-label">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      id="serialNumber"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter serial number"
                    />
                  </div>

                  <div>
                    <label htmlFor="condition" className="form-label">
                      Condition
                    </label>
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="form-input"
                    >
                      {conditions.map(condition => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Value */}
                <div>
                  <label htmlFor="value" className="form-label">
                    Value
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      className={`form-input pl-10 ${errors.value ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {errors.value && <p className="form-error">{errors.value}</p>}
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Equipment Image
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Equipment preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-danger-500 text-white rounded-full hover:bg-danger-600 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-600 hover:bg-gray-100 dark:border-gray-500 dark:hover:border-gray-400"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <CameraIcon className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Status
                </h3>
              </div>
              <div className="card-body">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="available">Available</option>
                  <option value="checked-out">Checked Out</option>
                  <option value="in-custody">In Custody</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Actions
                </h3>
              </div>
              <div className="card-body space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    <>
                      {isEditing ? 'Update Equipment' : 'Create Equipment'}
                    </>
                  )}
                </button>
                
                <Link
                  to="/equipment"
                  className="btn-outline w-full text-center"
                >
                  Cancel
                </Link>
              </div>
            </div>

            {/* Form Tips */}
            <div className="card bg-blue-50 dark:bg-blue-900">
              <div className="card-body">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Tips for better equipment management
                    </h4>
                    <ul className="mt-2 text-xs text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Add clear, descriptive names</li>
                      <li>• Include serial numbers when available</li>
                      <li>• Upload high-quality images</li>
                      <li>• Set accurate values for insurance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EquipmentForm;
