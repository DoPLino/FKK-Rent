const Equipment = require('../models/Equipment');
const QRCode = require('qrcode');
const { validationResult } = require('express-validator');

// Allowed status values for equipment lifecycle
const ALLOWED_STATUSES = ['available', 'checked-out', 'maintenance', 'damaged'];

// Whitelist of allowed sortable fields to prevent misuse of user-provided sort keys
const ALLOWED_SORT_FIELDS = ['createdAt', 'name'];

// Escape special regex characters to prevent ReDoS and unintended regex behavior
const escapeRegex = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

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

    // Normalize and clamp pagination params
    const MAX_LIMIT = 100;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    // Build filter object
    const filter = {};
    
    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { brand: { $regex: safeSearch, $options: 'i' } },
        { model: { $regex: safeSearch, $options: 'i' } },
        { serialNumber: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } }
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

    // Build sort object with whitelist validation to prevent unsafe field usage
    const safeSortBy =
      typeof sortBy === 'string' && ALLOWED_SORT_FIELDS.includes(sortBy)
        ? sortBy
        : 'createdAt';

    const safeSortOrder = sortOrder === 'asc' ? 1 : -1; // default to desc

    const sort = { [safeSortBy]: safeSortOrder };

    // Calculate pagination
    const skip = (parsedPage - 1) * parsedLimit;
    const total = await Equipment.countDocuments(filter);
    const totalPages = Math.ceil(total / parsedLimit);

    // Get equipment with pagination
    const equipment = await Equipment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit)
      .populate('location', 'name')
      .populate('lastBookedBy', 'firstName lastName');

    res.json({
      success: true,
      data: equipment,
      pagination: {
        currentPage: parsedPage,
        totalPages,
        totalItems: total,
        itemsPerPage: parsedLimit,
        hasNextPage: parsedPage < totalPages,
        hasPrevPage: parsedPage > 1
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
    
    // First save the equipment to get the actual _id
    const equipment = new Equipment(equipmentData);
    await equipment.save();

    // Now generate QR code using the saved _id
    const qrData = {
      id: equipment._id.toString(),
      type: 'equipment',
      name: equipment.name,
      serialNumber: equipment.serialNumber
    };

    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
    equipment.qrCode = qrCodeImage;
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
    const updateData = req.body || {};

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Whitelist of fields that are allowed to be updated by clients
    const allowedFields = [
      'name',
      'category',
      'brand',
      'model',
      'description',
      'specifications',
      'images',
      'status',
      'location',
      'purchaseDate',
      'purchasePrice',
      'currentValue',
      'rentalRate',
      'tags',
      'notes',
      'isActive'
    ];

    // Construct a sanitized update object containing only whitelisted fields
    const sanitizedUpdate = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        sanitizedUpdate[field] = updateData[field];
      }
    }

    // Validate status if present
    if (Object.prototype.hasOwnProperty.call(sanitizedUpdate, 'status')) {
      if (typeof sanitizedUpdate.status !== 'string' || !ALLOWED_STATUSES.includes(sanitizedUpdate.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed values are: ${ALLOWED_STATUSES.join(', ')}`
        });
      }
    }

    // Track who modified the record, without allowing the client to set it directly
    if (req.user && req.user.id) {
      sanitizedUpdate.lastModifiedBy = req.user.id;
    }

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      { $set: sanitizedUpdate },
      { new: true, runValidators: true, context: 'query' }
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
    // Support multiple input locations and formats:
    // - Path param: :qrCode or :code (URL-encoded JSON, base64 JSON, or DataURL)
    // - Query: ?qrCode= / ?code=
    // - Body (for potential POST usage): { qrCode } or { code }
    const rawInput =
      (req.params && (req.params.qrCode || req.params.code)) ||
      (req.query && (req.query.qrCode || req.query.code)) ||
      (req.body && (req.body.qrCode || req.body.code));

    if (!rawInput || typeof rawInput !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    const tryDecodeURIComponent = (value) => {
      try { return decodeURIComponent(value); } catch (_) { return value; }
    };

    // Normalize input
    let normalized = tryDecodeURIComponent(rawInput.trim());

    // If input is a Data URL like: data:image/png;base64,XXXX
    const dataUrlMatch = normalized.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
    if (dataUrlMatch && dataUrlMatch[1]) {
      try {
        const decoded = Buffer.from(dataUrlMatch[1], 'base64').toString('utf8');
        normalized = decoded;
      } catch (_) {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR code DataURL'
        });
      }
    }

    // If it still doesn't look like JSON, try base64 decoding
    if (typeof normalized === 'string' && !normalized.trim().startsWith('{')) {
      const base64Like = /^[A-Za-z0-9+/=]+$/.test(normalized);
      if (base64Like) {
        try {
          const decoded = Buffer.from(normalized, 'base64').toString('utf8');
          if (decoded.trim().startsWith('{')) {
            normalized = decoded;
          }
        } catch (_) {
          // ignore; will fail JSON.parse below
        }
      }
    }

    let qrData;
    try {
      qrData = JSON.parse(normalized);
    } catch (_) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format: expected JSON payload'
      });
    }

    if (!qrData || !qrData.id) {
      return res.status(400).json({
        success: false,
        message: 'QR code JSON must include an id'
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

    // Validate status input
    if (typeof status !== 'string' || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      { 
        status,
        ...(notes && { notes }),
        updatedAt: new Date()
      },
      { new: true, runValidators: true, context: 'query' }
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
    // Ensure the request is authenticated before proceeding
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user authentication required'
      });
    }

    const { id } = req.params;
    const { description, cost, date } = req.body;

    // Validate and normalize cost
    let normalizedCost = 0;
    if (typeof cost !== 'undefined') {
      const parsedCost = Number(cost);
      if (!Number.isFinite(parsedCost)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid cost: must be a number'
        });
      }
      normalizedCost = parsedCost;
    }

    // Validate and normalize date
    let normalizedDate = new Date();
    if (typeof date !== 'undefined') {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date: must be a valid date'
        });
      }
      normalizedDate = parsedDate;
    }

    const maintenanceRecord = {
      description,
      cost: normalizedCost,
      date: normalizedDate,
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
