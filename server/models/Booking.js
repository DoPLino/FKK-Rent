const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: [true, 'Equipment is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'overdue'],
    default: 'pending'
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    trim: true,
    maxlength: [500, 'Purpose cannot exceed 500 characters']
  },
  project: {
    type: String,
    trim: true,
    maxlength: [200, 'Project name cannot exceed 200 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  rentalRate: {
    daily: {
      type: Number,
      min: [0, 'Daily rate cannot be negative'],
      required: true
    },
    weekly: {
      type: Number,
      min: [0, 'Weekly rate cannot be negative']
    },
    monthly: {
      type: Number,
      min: [0, 'Monthly rate cannot be negative']
    }
  },
  totalCost: {
    type: Number,
    min: [0, 'Total cost cannot be negative'],
    default: 0
  },
  deposit: {
    type: Number,
    min: [0, 'Deposit cannot be negative'],
    default: 0
  },
  depositReturned: {
    type: Boolean,
    default: false
  },
  depositReturnDate: {
    type: Date
  },
  checkOutDate: {
    type: Date
  },
  checkInDate: {
    type: Date
  },
  checkedOutBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  equipmentCondition: {
    checkOut: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    checkIn: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    }
  },
  damageReport: {
    hasDamage: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Damage description cannot exceed 1000 characters']
    },
    images: [{
      url: String,
      alt: String
    }],
    repairCost: {
      type: Number,
      min: [0, 'Repair cost cannot be negative']
    }
  },
  reminders: [{
    type: {
      type: String,
      enum: ['checkout', 'return', 'overdue'],
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentTo: {
      type: String,
      required: true
    }
  }],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ equipment: 1 });
bookingSchema.index({ user: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ checkOutDate: 1 });
bookingSchema.index({ checkInDate: 1 });

// Virtual for booking duration in days
bookingSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.endDate) return 0;
  const durationMs = this.endDate - this.startDate;
  return Math.ceil(durationMs / (1000 * 60 * 60 * 24));
});

// Virtual for checking if booking is active
bookingSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Virtual for checking if booking is overdue
bookingSchema.virtual('isOverdue').get(function() {
  const now = new Date();
  return this.status === 'active' && this.endDate < now;
});

// Virtual for days overdue
bookingSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const now = new Date();
  const overdueMs = now - this.endDate;
  return Math.ceil(overdueMs / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to calculate total cost
bookingSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.rentalRate) {
    const duration = this.duration;
    let cost = 0;
    
    if (duration >= 30 && this.rentalRate.monthly) {
      const months = Math.floor(duration / 30);
      const remainingDays = duration % 30;
      cost = (months * this.rentalRate.monthly) + (remainingDays * this.rentalRate.daily);
    } else if (duration >= 7 && this.rentalRate.weekly) {
      const weeks = Math.floor(duration / 7);
      const remainingDays = duration % 7;
      cost = (weeks * this.rentalRate.weekly) + (remainingDays * this.rentalRate.daily);
    } else {
      cost = duration * this.rentalRate.daily;
    }
    
    this.totalCost = cost;
  }
  next();
});

// Method to check out equipment
bookingSchema.methods.checkOut = function(userId) {
  this.status = 'active';
  this.checkOutDate = new Date();
  this.checkedOutBy = userId;
  return this.save();
};

// Method to check in equipment
bookingSchema.methods.checkIn = function(userId, condition = 'good') {
  this.status = 'completed';
  this.checkInDate = new Date();
  this.checkedInBy = userId;
  this.equipmentCondition.checkIn = condition;
  return this.save();
};

// Method to cancel booking
bookingSchema.methods.cancel = function(userId, reason = '') {
  this.status = 'cancelled';
  this.cancelledBy = userId;
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  return this.save();
};

// Method to add reminder
bookingSchema.methods.addReminder = function(type, sentTo) {
  this.reminders.push({ type, sentTo });
  return this.save();
};

// Method to report damage
bookingSchema.methods.reportDamage = function(description, images = [], repairCost = 0) {
  this.damageReport = {
    hasDamage: true,
    description,
    images,
    repairCost
  };
  return this.save();
};

// Static method to find active bookings
bookingSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).populate(['equipment', 'user']);
};

// Static method to find overdue bookings
bookingSchema.statics.findOverdue = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    endDate: { $lt: now }
  }).populate(['equipment', 'user']);
};

// Static method to find conflicting bookings
bookingSchema.statics.findConflicts = function(equipmentId, startDate, endDate, excludeBookingId = null) {
  const query = {
    equipment: equipmentId,
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      {
        startDate: { $lt: endDate },
        endDate: { $gt: startDate }
      }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  return this.find(query);
};

// Static method to get booking statistics
bookingSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        totalRevenue: { $sum: '$totalCost' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0
  };
};

module.exports = mongoose.model('Booking', bookingSchema);
