const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const {
  getAllEquipment,
  getEquipmentById,
  getEquipmentByQR,
  createEquipment,
  updateEquipment,
  updateEquipmentStatus,
  addMaintenanceRecord,
  deleteEquipment,
  getEquipmentStats,
  generateQRCode
} = require('../controllers/equipmentController');

const { 
  authenticateToken, 
  requireStaff, 
  requireAdmin,
  requireEquipmentAccess 
} = require('../middleware/auth');

// Validation middleware
const createEquipmentValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Equipment name is required and must be less than 100 characters'),
  body('category')
    .isIn(['camera', 'lens', 'lighting', 'audio', 'tripod', 'grip', 'monitor', 'computer', 'cable', 'accessory', 'other'])
    .withMessage('Invalid category'),
  body('brand')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand is required and must be less than 50 characters'),
  body('model')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model is required and must be less than 100 characters'),
  body('serialNumber')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Serial number is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('location')
    .isMongoId()
    .withMessage('Valid location ID is required'),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a positive number'),
  body('currentValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current value must be a positive number'),
  body('rentalRate.daily')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Daily rental rate must be a positive number'),
  body('rentalRate.weekly')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weekly rental rate must be a positive number'),
  body('rentalRate.monthly')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly rental rate must be a positive number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const updateEquipmentValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid equipment ID is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Equipment name must be between 1 and 100 characters'),
  body('category')
    .optional()
    .isIn(['camera', 'lens', 'lighting', 'audio', 'tripod', 'grip', 'monitor', 'computer', 'cable', 'accessory', 'other'])
    .withMessage('Invalid category'),
  body('brand')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand must be between 1 and 50 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model must be between 1 and 100 characters'),
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Serial number is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('location')
    .optional()
    .isMongoId()
    .withMessage('Valid location ID is required'),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a positive number'),
  body('currentValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current value must be a positive number'),
  body('rentalRate.daily')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Daily rental rate must be a positive number'),
  body('rentalRate.weekly')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weekly rental rate must be a positive number'),
  body('rentalRate.monthly')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly rental rate must be a positive number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const updateStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid equipment ID is required'),
  body('status')
    .isIn(['available', 'booked', 'rented', 'maintenance', 'damaged', 'lost'])
    .withMessage('Invalid status')
];

const maintenanceValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid equipment ID is required'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Maintenance description is required and must be less than 1000 characters'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date')
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
  query('category')
    .optional()
    .isIn(['camera', 'lens', 'lighting', 'audio', 'tripod', 'grip', 'monitor', 'computer', 'cable', 'accessory', 'other'])
    .withMessage('Invalid category'),
  query('status')
    .optional()
    .isIn(['available', 'booked', 'rented', 'maintenance', 'damaged', 'lost'])
    .withMessage('Invalid status'),
  query('location')
    .optional()
    .isMongoId()
    .withMessage('Valid location ID is required'),
  query('sortBy')
    .optional()
    .isIn(['name', 'brand', 'model', 'status', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Public routes
router.get('/', queryValidation, getAllEquipment);
router.get('/qr/:qrCode', getEquipmentByQR);
router.get('/:id', param('id').isMongoId().withMessage('Valid equipment ID is required'), getEquipmentById);

// Protected routes
router.use(authenticateToken);

// Staff/Admin routes
router.post('/', requireStaff, createEquipmentValidation, createEquipment);
router.put('/:id', requireStaff, updateEquipmentValidation, updateEquipment);
router.patch('/:id/status', requireStaff, updateStatusValidation, updateEquipmentStatus);
router.post('/:id/maintenance', requireStaff, maintenanceValidation, addMaintenanceRecord);
router.get('/:id/qr', requireStaff, param('id').isMongoId().withMessage('Valid equipment ID is required'), generateQRCode);

// Admin only routes
router.delete('/:id', requireAdmin, param('id').isMongoId().withMessage('Valid equipment ID is required'), deleteEquipment);
router.get('/stats/overview', requireStaff, getEquipmentStats);

module.exports = router;
