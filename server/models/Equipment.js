const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'camera',
      'lens',
      'lighting',
      'audio',
      'tripod',
      'grip',
      'monitor',
      'computer',
      'cable',
      'accessory',
      'other'
    ]
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    maxlength: [50, 'Brand cannot exceed 50 characters']
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters']
  },
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Equipment image'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['available', 'booked', 'rented', 'maintenance', 'damaged', 'lost'],
    default: 'available'
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location is required']
  },
  qrCode: {
    type: String,
    unique: true,
    required: true,
    // Ensure a value exists before validation
    default: function() {
      if (this.serialNumber) {
        return `EQ-${this.serialNumber}-${Date.now()}`;
      }
      return `EQ-${Date.now()}`;
    }
  },
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number,
    min: [0, 'Purchase price cannot be negative']
  },
  currentValue: {
    type: Number,
    min: [0, 'Current value cannot be negative']
  },
  maintenanceHistory: [{
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  rentalRate: {
    daily: {
      type: Number,
      min: [0, 'Daily rate cannot be negative'],
      default: 0
    },
    weekly: {
      type: Number,
      min: [0, 'Weekly rate cannot be negative'],
      default: 0
    },
    monthly: {
      type: Number,
      min: [0, 'Monthly rate cannot be negative'],
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastCheckedOut: {
    type: Date
  },
  lastCheckedIn: {
    type: Date
  },
  totalRentals: {
    type: Number,
    default: 0,
    min: [0, 'Total rentals cannot be negative']
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: [0, 'Total revenue cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance (serialNumber and qrCode are already indexed via unique: true)
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ location: 1 });
equipmentSchema.index({ brand: 1, model: 1 });
equipmentSchema.index({ tags: 1 });

// Virtual for full equipment name
equipmentSchema.virtual('fullName').get(function() {
  return `${this.brand} ${this.model} - ${this.name}`;
});

// Virtual for availability status
equipmentSchema.virtual('isAvailable').get(function() {
  return this.status === 'available';
});

// Virtual for equipment age
equipmentSchema.virtual('age').get(function() {
  if (!this.purchaseDate) return null;
  const now = new Date();
  const ageInMs = now - this.purchaseDate;
  const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(ageInYears);
});

// Pre-save middleware to generate QR code if not exists
equipmentSchema.pre('save', async function(next) {
  if (!this.qrCode) {
    this.qrCode = `EQ-${this.serialNumber}-${Date.now()}`;
  }
  next();
});

// Method to update status
equipmentSchema.methods.updateStatus = function(newStatus, userId) {
  this.status = newStatus;
  this.lastModifiedBy = userId;
  
  if (newStatus === 'rented') {
    this.lastCheckedOut = new Date();
    this.totalRentals += 1;
  } else if (newStatus === 'available') {
    this.lastCheckedIn = new Date();
  }
  
  return this.save();
};

// Method to add maintenance record
equipmentSchema.methods.addMaintenanceRecord = function(record) {
  this.maintenanceHistory.push(record);
  return this.save();
};

// Method to get primary image
equipmentSchema.methods.getPrimaryImage = function() {
  const primaryImage = this.images.find(img => img.isPrimary);
  return primaryImage ? primaryImage.url : (this.images[0] ? this.images[0].url : null);
};

// Static method to find available equipment
equipmentSchema.statics.findAvailable = function(filters = {}) {
  const query = { status: 'available', isActive: true, ...filters };
  return this.find(query).populate('location');
};

// Static method to find equipment by QR code
equipmentSchema.statics.findByQRCode = function(qrCode) {
  return this.findOne({ qrCode, isActive: true }).populate('location');
};

// Static method to get equipment statistics
equipmentSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
        rented: { $sum: { $cond: [{ $eq: ['$status', 'rented'] }, 1, 0] } },
        maintenance: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } },
        totalValue: { $sum: '$currentValue' },
        totalRevenue: { $sum: '$totalRevenue' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    available: 0,
    rented: 0,
    maintenance: 0,
    totalValue: 0,
    totalRevenue: 0
  };
};

module.exports = mongoose.model('Equipment', equipmentSchema);
