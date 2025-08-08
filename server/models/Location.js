const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [100, 'Location name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['warehouse', 'studio', 'office', 'storage', 'workshop', 'other'],
    default: 'storage'
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Street cannot exceed 200 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Zip code cannot exceed 20 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters']
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  capacity: {
    total: {
      type: Number,
      min: [0, 'Total capacity cannot be negative']
    },
    used: {
      type: Number,
      min: [0, 'Used capacity cannot be negative'],
      default: 0
    }
  },
  contactPerson: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Contact name cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  accessHours: {
    monday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    tuesday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    wednesday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    thursday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    friday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    saturday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: true }
    },
    sunday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: true }
    }
  },
  facilities: [{
    type: String,
    enum: [
      'loading_dock',
      'parking',
      'security',
      'climate_control',
      'power_outlets',
      'internet',
      'bathroom',
      'kitchen',
      'meeting_room',
      'workshop',
      'other'
    ]
  }],
  security: {
    requiresKey: {
      type: Boolean,
      default: false
    },
    requiresCode: {
      type: Boolean,
      default: false
    },
    accessCode: {
      type: String,
      select: false
    },
    securityNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Security notes cannot exceed 500 characters']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  subLocations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }],
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

// Indexes for better query performance
locationSchema.index({ name: 1 });
locationSchema.index({ type: 1 });
locationSchema.index({ isActive: 1 });
locationSchema.index({ 'address.city': 1 });

// Virtual for full address
locationSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  const parts = [];
  
  if (addr.street) parts.push(addr.street);
  if (addr.city) parts.push(addr.city);
  if (addr.state) parts.push(addr.state);
  if (addr.zipCode) parts.push(addr.zipCode);
  if (addr.country) parts.push(addr.country);
  
  return parts.join(', ');
});

// Virtual for capacity usage percentage
locationSchema.virtual('capacityUsage').get(function() {
  if (!this.capacity.total) return 0;
  return Math.round((this.capacity.used / this.capacity.total) * 100);
});

// Virtual for availability status
locationSchema.virtual('isAvailable').get(function() {
  if (!this.isActive) return false;
  if (!this.capacity.total) return true;
  return this.capacity.used < this.capacity.total;
});

// Method to update capacity usage
locationSchema.methods.updateCapacityUsage = function() {
  return this.model('Equipment').countDocuments({ 
    location: this._id, 
    isActive: true 
  }).then(count => {
    this.capacity.used = count;
    return this.save();
  });
};

// Method to check if location is accessible at given time
locationSchema.methods.isAccessible = function(date = new Date()) {
  const dayOfWeek = date.toLocaleLowerCase().slice(0, 3);
  const time = date.toTimeString().slice(0, 5);
  
  const daySchedule = this.accessHours[dayOfWeek];
  if (!daySchedule || daySchedule.closed) return false;
  
  return time >= daySchedule.open && time <= daySchedule.close;
};

// Static method to find available locations
locationSchema.statics.findAvailable = function() {
  return this.find({ isActive: true }).populate('parentLocation');
};

// Static method to find locations by type
locationSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

// Static method to find locations by city
locationSchema.statics.findByCity = function(city) {
  return this.find({ 
    'address.city': { $regex: city, $options: 'i' },
    isActive: true 
  });
};

// Static method to get location statistics
locationSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        byType: {
          $push: {
            type: '$type',
            name: '$name'
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    active: 0,
    byType: []
  };
};

module.exports = mongoose.model('Location', locationSchema);
