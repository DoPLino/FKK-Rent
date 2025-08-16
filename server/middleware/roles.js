/**
 * Middleware to check user roles
 */

/**
 * Factory for role‐checking middleware.
 * @param {string[]} allowedRoles
 * @returns {import('express').RequestHandler}
 */
const checkRole = (allowedRoles) => {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error('checkRole requires a non‐empty array of roles');
  }
  const normalizedAllowed = allowedRoles.map(r => String(r).toLowerCase());
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Support both a single role (req.user.role) and multiple (req.user.roles)
    const rawRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : [req.user?.role];
    const normalizedUserRoles = rawRoles
      .filter(Boolean)
      .map(r => String(r).toLowerCase());
    const hasRole = normalizedUserRoles.some(r =>
      normalizedAllowed.includes(r)
    );
    if (!hasRole) {
      return res.status(403).json({
        message: 'Access denied. Insufficient permissions.'
      });
    }

    return next();
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
