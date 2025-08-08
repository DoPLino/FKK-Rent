const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired.' 
      });
    }
    return res.status(500).json({ 
      message: 'Token verification failed.' 
    });
  }
};

// Middleware to check if user has admin role
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required.' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Admin access required.' 
    });
  }

  next();
};

// Middleware to check if user has staff or admin role
const requireStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required.' 
    });
  }

  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Staff access required.' 
    });
  }

  next();
};

// Middleware to check if user can access their own data or is admin
const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required.' 
    });
  }

  const requestedUserId = req.params.userId || req.params.id;
  
  if (req.user.role === 'admin' || req.user._id.toString() === requestedUserId) {
    return next();
  }

  return res.status(403).json({ 
    message: 'Access denied. You can only access your own data.' 
  });
};

// Middleware to check if user can modify equipment (admin, staff, or owner)
const requireEquipmentAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required.' 
    });
  }

  if (['admin', 'staff'].includes(req.user.role)) {
    return next();
  }

  // For external users, they can only view equipment
  if (req.method === 'GET') {
    return next();
  }

  return res.status(403).json({ 
    message: 'Access denied. Only staff and admins can modify equipment.' 
  });
};

// Middleware to check if user can manage bookings
const requireBookingAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required.' 
    });
  }

  if (['admin', 'staff'].includes(req.user.role)) {
    return next();
  }

  const requestedBookingId = req.params.bookingId || req.params.id;
  
  // External users can only access their own bookings
  if (req.method === 'GET' && requestedBookingId) {
    // This will be checked in the controller
    return next();
  }

  return res.status(403).json({ 
    message: 'Access denied. Only staff and admins can manage all bookings.' 
  });
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Rate limiting middleware for authentication endpoints
const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireStaff,
  requireOwnershipOrAdmin,
  requireEquipmentAccess,
  requireBookingAccess,
  optionalAuth,
  authRateLimit
};
