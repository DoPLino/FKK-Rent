const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const { authenticateToken, requireStaff } = require('../middleware/auth');

// Placeholder for location controller (to be implemented)
const locationController = {
  getAllLocations: async (req, res) => {
    res.json({ message: 'Get all locations - to be implemented' });
  },
  getLocationById: async (req, res) => {
    res.json({ message: 'Get location by ID - to be implemented' });
  },
  createLocation: async (req, res) => {
    res.json({ message: 'Create location - to be implemented' });
  },
  updateLocation: async (req, res) => {
    res.json({ message: 'Update location - to be implemented' });
  },
  deleteLocation: async (req, res) => {
    res.json({ message: 'Delete location - to be implemented' });
  },
  getLocationStats: async (req, res) => {
    res.json({ message: 'Get location stats - to be implemented' });
  }
};

// Validation middleware
const createLocationValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location name is required and must be less than 100 characters'),
  body('type')
    .isIn(['warehouse', 'studio', 'office', 'storage', 'workshop', 'other'])
    .withMessage('Invalid location type'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street must be less than 200 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Zip code must be less than 20 characters'),
  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('capacity.total')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total capacity must be a positive integer'),
  body('contactPerson.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact name must be less than 100 characters'),
  body('contactPerson.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('contactPerson.phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('facilities')
    .optional()
    .isArray()
    .withMessage('Facilities must be an array'),
  body('facilities.*')
    .optional()
    .isIn(['loading_dock', 'parking', 'security', 'climate_control', 'power_outlets', 'internet', 'bathroom', 'kitchen', 'meeting_room', 'workshop', 'other'])
    .withMessage('Invalid facility type'),
  body('security.requiresKey')
    .optional()
    .isBoolean()
    .withMessage('requiresKey must be a boolean'),
  body('security.requiresCode')
    .optional()
    .isBoolean()
    .withMessage('requiresCode must be a boolean'),
  body('security.accessCode')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Access code is required when requiresCode is true'),
  body('security.securityNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Security notes must be less than 500 characters'),
  body('parentLocation')
    .optional()
    .isMongoId()
    .withMessage('Valid parent location ID is required')
];

const updateLocationValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid location ID is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location name must be between 1 and 100 characters'),
  body('type')
    .optional()
    .isIn(['warehouse', 'studio', 'office', 'storage', 'workshop', 'other'])
    .withMessage('Invalid location type'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street must be less than 200 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Zip code must be less than 20 characters'),
  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('capacity.total')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total capacity must be a positive integer'),
  body('contactPerson.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact name must be less than 100 characters'),
  body('contactPerson.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('contactPerson.phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('facilities')
    .optional()
    .isArray()
    .withMessage('Facilities must be an array'),
  body('facilities.*')
    .optional()
    .isIn(['loading_dock', 'parking', 'security', 'climate_control', 'power_outlets', 'internet', 'bathroom', 'kitchen', 'meeting_room', 'workshop', 'other'])
    .withMessage('Invalid facility type'),
  body('security.requiresKey')
    .optional()
    .isBoolean()
    .withMessage('requiresKey must be a boolean'),
  body('security.requiresCode')
    .optional()
    .isBoolean()
    .withMessage('requiresCode must be a boolean'),
  body('security.accessCode')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Access code is required when requiresCode is true'),
  body('security.securityNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Security notes must be less than 500 characters'),
  body('parentLocation')
    .optional()
    .isMongoId()
    .withMessage('Valid parent location ID is required'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['warehouse', 'studio', 'office', 'storage', 'workshop', 'other'])
    .withMessage('Invalid location type'),
  query('city')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('City search term must not be empty'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term must not be empty'),
  query('sortBy')
    .optional()
    .isIn(['name', 'type', 'city', 'capacityUsage', 'createdAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Routes
router.use(authenticateToken);

// Get all locations (public for authenticated users)
router.get('/', queryValidation, locationController.getAllLocations);

// Get location by ID
router.get('/:id', 
  param('id').isMongoId().withMessage('Valid location ID is required'), 
  locationController.getLocationById
);

// Staff/Admin routes
router.post('/', requireStaff, createLocationValidation, locationController.createLocation);
router.put('/:id', requireStaff, updateLocationValidation, locationController.updateLocation);
router.delete('/:id', requireStaff, 
  param('id').isMongoId().withMessage('Valid location ID is required'), 
  locationController.deleteLocation
);

// Get location statistics (staff/admin only)
router.get('/stats/overview', requireStaff, locationController.getLocationStats);

module.exports = router;
