const ForbiddenError = require("../../errors/ForbiddenError");

/**
 * Higher-order middleware to enforce Role-Based Access Control (RBAC).
 * @param  {...string} allowedRoles - Roles permitted to access the route.
 * @returns {Function} Express middleware.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError("Access denied. Insufficient permissions."),
      );
    }
    next();
  };
};

module.exports = {
  authorize,
};
