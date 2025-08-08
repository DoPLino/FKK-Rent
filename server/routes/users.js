const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const { authenticateToken, requireAdmin, requireOwnershipOrAdmin } = require('../middleware/auth');

// Placeholder for user controller (to be implemented)
const userController = {
  getAllUsers: async (req, res) => {
    res.json({ message: 'Get all users - to be implemented' });
  },
  getUserById: async (req, res) => {
    res.json({ message: 'Get user by ID - to be implemented' });
  },
  createUser: async (req, res) => {
    res.json({ message: 'Create user - to be implemented' });
  },
  updateUser: async (req, res) => {
    res.json({ message: 'Update user - to be implemented' });
  },
  deleteUser: async (req, res) => {
    res.json({ message: 'Delete user - to be implemented' });
  },
  updateUserRole: async (req, res) => {
    res.json({ message: 'Update user role - to be implemented' });
  },
  getUserStats: async (req, res) => {
    res.json({ message: 'Get user stats - to be implemented' });
  }
};

// Validation middleware
const createUserValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('role')
    .isIn(['admin', 'staff', 'external'])
    .withMessage('Invalid role'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number')
];

const updateUserValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const updateRoleValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('role')
    .isIn(['admin', 'staff', 'external'])
    .withMessage('Invalid role')
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
  query('role')
    .optional()
    .isIn(['admin', 'staff', 'external'])
    .withMessage('Invalid role'),
  query('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters'),
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
    .isIn(['firstName', 'lastName', 'email', 'role', 'createdAt', 'lastLogin'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Routes
router.use(authenticateToken);

// Admin only routes
router.get('/', requireAdmin, queryValidation, userController.getAllUsers);
router.get('/stats/overview', requireAdmin, userController.getUserStats);

// User management routes
router.post('/', requireAdmin, createUserValidation, userController.createUser);
router.get('/:id', requireOwnershipOrAdmin, 
  param('id').isMongoId().withMessage('Valid user ID is required'), 
  userController.getUserById
);
router.put('/:id', requireOwnershipOrAdmin, updateUserValidation, userController.updateUser);
router.delete('/:id', requireAdmin, 
  param('id').isMongoId().withMessage('Valid user ID is required'), 
  userController.deleteUser
);

// Role management (admin only)
router.patch('/:id/role', requireAdmin, updateRoleValidation, userController.updateUserRole);

module.exports = router;
