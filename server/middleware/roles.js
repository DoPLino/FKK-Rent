/**
 * Middleware to check user roles
 */

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

const requireAdmin = (req, res, next) => {
  return checkRole(['admin'])(req, res, next);
};

const requireStaff = (req, res, next) => {
  return checkRole(['admin', 'staff'])(req, res, next);
};

const requireExternal = (req, res, next) => {
  return checkRole(['admin', 'staff', 'external'])(req, res, next);
};

module.exports = {
  checkRole,
  requireAdmin,
  requireStaff,
  requireExternal
};
