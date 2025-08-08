const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all bookings with filtering and pagination
const getAllBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      equipment = '',
      user = '',
      startDate = '',
      endDate = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { purpose: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (equipment && equipment !== 'all') {
      filter.equipment = equipment;
    }

    if (user && user !== 'all') {
      filter.user = user;
    }

    if (startDate && endDate) {
      filter.startDate = { $gte: new Date(startDate) };
      filter.endDate = { $lte: new Date(endDate) };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get bookings with pagination
    const bookings = await Booking.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('equipment', 'name category serialNumber')
      .populate('user', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');

    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id)
      .populate('equipment', 'name category serialNumber location status')
      .populate('user', 'firstName lastName email phone department')
      .populate('approvedBy', 'firstName lastName')
      .populate('cancelledBy', 'firstName lastName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error getting booking by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Create new booking
const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const bookingData = req.body;
    bookingData.user = req.user._id;

    // Check if equipment exists and is available
    const equipment = await Equipment.findById(bookingData.equipment);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    if (equipment.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Equipment is not available for booking'
      });
    }

    // Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      equipment: bookingData.equipment,
      status: { $in: ['pending', 'approved', 'active'] },
      $or: [
        {
          startDate: { $lte: new Date(bookingData.endDate) },
          endDate: { $gte: new Date(bookingData.startDate) }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Equipment is already booked for the selected dates'
      });
    }

    // Create booking
    const booking = new Booking(bookingData);
    await booking.save();

    // Update equipment status if auto-approved
    if (booking.status === 'approved') {
      equipment.status = 'checked-out';
      equipment.lastBookedBy = req.user._id;
      equipment.lastBookedAt = new Date();
      await equipment.save();
    }

    // Populate references
    await booking.populate('equipment', 'name category serialNumber');
    await booking.populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be updated
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update cancelled or completed booking'
      });
    }

    // Update booking
    Object.assign(booking, updateData);
    await booking.save();

    // Populate references
    await booking.populate('equipment', 'name category serialNumber');
    await booking.populate('user', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Approve booking
const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not pending approval'
      });
    }

    // Update booking status
    booking.status = 'approved';
    booking.approvedBy = req.user._id;
    booking.approvedAt = new Date();
    if (notes) booking.adminNotes = notes;

    await booking.save();

    // Update equipment status
    const equipment = await Equipment.findById(booking.equipment);
    if (equipment) {
      equipment.status = 'checked-out';
      equipment.lastBookedBy = booking.user;
      equipment.lastBookedAt = new Date();
      await equipment.save();
    }

    // Populate references
    await booking.populate('equipment', 'name category serialNumber');
    await booking.populate('user', 'firstName lastName email');
    await booking.populate('approvedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Booking approved successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error approving booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled or completed'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledBy = req.user._id;
    booking.cancelledAt = new Date();
    if (reason) booking.cancellationReason = reason;

    await booking.save();

    // Update equipment status if it was checked out
    if (booking.status === 'active' || booking.status === 'approved') {
      const equipment = await Equipment.findById(booking.equipment);
      if (equipment) {
        equipment.status = 'available';
        await equipment.save();
      }
    }

    // Populate references
    await booking.populate('equipment', 'name category serialNumber');
    await booking.populate('user', 'firstName lastName email');
    await booking.populate('cancelledBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Check equipment availability
const checkAvailability = async (req, res) => {
  try {
    const { equipmentId, startDate, endDate } = req.body;

    if (!equipmentId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Equipment ID, start date, and end date are required'
      });
    }

    // Check if equipment exists
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      equipment: equipmentId,
      status: { $in: ['pending', 'approved', 'active'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    const isAvailable = conflictingBookings.length === 0 && equipment.status === 'available';

    res.json({
      success: true,
      data: {
        available: isAvailable,
        equipment: {
          id: equipment._id,
          name: equipment.name,
          status: equipment.status
        },
        conflicts: conflictingBookings.map(booking => ({
          id: booking._id,
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: booking.status
        }))
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get user bookings
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status = '', limit = 10 } = req.query;

    const filter = { user: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('equipment', 'name category serialNumber image')
      .populate('approvedBy', 'firstName lastName');

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get booking statistics
const getBookingStats = async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get monthly booking trends
    const monthlyStats = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Get equipment booking frequency
    const equipmentStats = await Booking.aggregate([
      {
        $group: {
          _id: '$equipment',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          pending: 0,
          approved: 0,
          active: 0,
          completed: 0,
          cancelled: 0
        },
        monthlyTrends: monthlyStats,
        topEquipment: equipmentStats
      }
    });
  } catch (error) {
    console.error('Error getting booking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Add missing functions
const getBookings = getAllBookings;
const getBooking = getBookingById;
const getUpcomingBookings = async (req, res) => {
  try {
    const upcomingBookings = await Booking.find({
      startDate: { $gte: new Date() },
      status: { $in: ['approved', 'active'] }
    })
    .sort({ startDate: 1 })
    .limit(10)
    .populate('equipment', 'name category')
    .populate('user', 'firstName lastName');

    res.json({
      success: true,
      data: upcomingBookings
    });
  } catch (error) {
    console.error('Error getting upcoming bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upcoming bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

const getOverdueBookings = async (req, res) => {
  try {
    const overdueBookings = await Booking.find({
      endDate: { $lt: new Date() },
      status: { $in: ['approved', 'active'] }
    })
    .populate('equipment', 'name category')
    .populate('user', 'firstName lastName email');

    res.json({
      success: true,
      data: overdueBookings
    });
  } catch (error) {
    console.error('Error getting overdue bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get overdue bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

const exportBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('equipment', 'name category serialNumber')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Simple CSV export
    const csvData = bookings.map(booking => ({
      id: booking._id,
      equipment: booking.equipment?.name || 'Unknown',
      user: `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim(),
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      purpose: booking.purpose,
      notes: booking.notes
    }));

    res.json({
      success: true,
      data: csvData,
      message: 'Bookings exported successfully'
    });
  } catch (error) {
    console.error('Error exporting bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getAllBookings,
  getBookings,
  getBookingById,
  getBooking,
  createBooking,
  updateBooking,
  approveBooking,
  cancelBooking,
  checkAvailability,
  getUserBookings,
  getBookingStats,
  getUpcomingBookings,
  getOverdueBookings,
  exportBookings
};
