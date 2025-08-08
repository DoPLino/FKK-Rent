const express = require('express');
const { body } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roles');

const router = express.Router();

// Validation rules
const bookingValidation = [
  body('equipment').isMongoId().withMessage('Valid equipment ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('notes').optional().isString().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
];

const updateBookingValidation = [
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('notes').optional().isString().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  body('status').optional().isIn(['pending', 'active', 'completed', 'cancelled']).withMessage('Invalid status')
];

// Public routes (require authentication)
router.use(authenticateToken);

// Get all bookings (admin/staff can see all, users see their own)
router.get('/', bookingController.getBookings);

// Get user's own bookings
router.get('/user', bookingController.getUserBookings);

// Get single booking
router.get('/:id', bookingController.getBooking);

// Create new booking
router.post('/', bookingValidation, bookingController.createBooking);

// Update booking
router.put('/:id', updateBookingValidation, bookingController.updateBooking);

// Cancel booking
router.patch('/:id/cancel', bookingController.cancelBooking);

// Check availability
router.post('/check-availability', [
  body('equipment').isMongoId().withMessage('Valid equipment ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
], bookingController.checkAvailability);

// Admin only routes
router.get('/stats/overview', checkRole(['admin', 'staff']), bookingController.getBookingStats);
router.get('/upcoming', checkRole(['admin', 'staff']), bookingController.getUpcomingBookings);
router.get('/overdue', checkRole(['admin', 'staff']), bookingController.getOverdueBookings);
router.get('/export/csv', checkRole(['admin', 'staff']), bookingController.exportBookings);

module.exports = router;
