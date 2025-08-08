const Equipment = require('../models/Equipment');
const QRCode = require('qrcode');
const { validationResult } = require('express-validator');

// Get all equipment with filtering and pagination
const getAllEquipment = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      category = '',
      location = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (location && location !== 'all') {
      filter.location = location;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Equipment.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get equipment with pagination
    const equipment = await Equipment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('location', 'name')
      .populate('lastBookedBy', 'firstName lastName');

    res.json({
      success: true,
      data: equipment,
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
    console.error('Error getting equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get equipment',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get equipment by ID
const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const equipment = await Equipment.findById(id)
      .populate('location', 'name address')
      .populate('lastBookedBy', 'firstName lastName email')
      .populate('maintenanceHistory.user', 'firstName lastName');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Error getting equipment by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get equipment',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Create new equipment
const createEquipment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const equipmentData = req.body;
    
    // Generate QR code
    const qrData = {
      id: Date.now().toString(),
      type: 'equipment',
      name: equipmentData.name,
      serialNumber: equipmentData.serialNumber
    };

    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
    equipmentData.qrCode = qrCodeImage;

    const equipment = new Equipment(equipmentData);
    await equipment.save();

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Error creating equipment:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Equipment with this serial number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create equipment',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update equipment
const updateEquipment = async (req, res) => {
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

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('location', 'name');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Equipment with this serial number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update equipment',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Delete equipment
const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findByIdAndDelete(id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete equipment',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Generate QR code for equipment
const generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'png', size = 300 } = req.query;

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const qrData = {
      id: equipment._id.toString(),
      type: 'equipment',
      name: equipment.name,
      serialNumber: equipment.serialNumber,
      category: equipment.category,
      location: equipment.location,
      timestamp: new Date().toISOString()
    };

    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: parseInt(size),
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      data: {
        qrImageUrl: qrCodeImage,
        qrData: qrData,
        equipment: {
          id: equipment._id,
          name: equipment.name,
          serialNumber: equipment.serialNumber,
          category: equipment.category,
          location: equipment.location
        }
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get equipment statistics
const getEquipmentStats = async (req, res) => {
  try {
    const stats = await Equipment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          },
          checkedOut: {
            $sum: { $cond: [{ $eq: ['$status', 'checked-out'] }, 1, 0] }
          },
          maintenance: {
            $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] }
          },
          damaged: {
            $sum: { $cond: [{ $eq: ['$status', 'damaged'] }, 1, 0] }
          }
        }
      }
    ]);

    const categoryStats = await Equipment.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const locationStats = await Equipment.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          available: 0,
          checkedOut: 0,
          maintenance: 0,
          damaged: 0
        },
        byCategory: categoryStats,
        byLocation: locationStats
      }
    });
  } catch (error) {
    console.error('Error getting equipment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get equipment statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Search equipment by QR code
const searchByQRCode = async (req, res) => {
  try {
    const { code } = req.params;

    let qrData;
    try {
      qrData = JSON.parse(code);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format'
      });
    }

    const equipment = await Equipment.findById(qrData.id)
      .populate('location', 'name address')
      .populate('lastBookedBy', 'firstName lastName');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Error searching by QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search equipment',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get equipment by QR code (alias for searchByQRCode)
const getEquipmentByQR = searchByQRCode;

// Update equipment status
const updateEquipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      { 
        status,
        ...(notes && { notes }),
        updatedAt: new Date()
      },
      { new: true }
    ).populate('location', 'name');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      data: equipment,
      message: 'Equipment status updated successfully'
    });
  } catch (error) {
    console.error('Error updating equipment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update equipment status',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Add maintenance record
const addMaintenanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, cost, date } = req.body;

    const maintenanceRecord = {
      description,
      cost: cost || 0,
      date: date || new Date(),
      user: req.user.id
    };

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      { 
        $push: { maintenanceHistory: maintenanceRecord },
        status: 'maintenance',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('location', 'name');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      data: equipment,
      message: 'Maintenance record added successfully'
    });
  } catch (error) {
    console.error('Error adding maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add maintenance record',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  getEquipmentByQR,
  createEquipment,
  updateEquipment,
  updateEquipmentStatus,
  addMaintenanceRecord,
  deleteEquipment,
  generateQRCode,
  getEquipmentStats,
  searchByQRCode
};
