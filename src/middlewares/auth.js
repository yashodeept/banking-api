const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

// We use process.env.JWT_SECRET or fall back to a safe default for development
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "default-jwt-secret-key-for-local-dev-only-banking-api";

/**
 * Authentication protector middleware.
 * Verifies the JWT token from the Authorization header or cookies,
 * and attaches the decoded user payload to the request object.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token from Authorization header or cookie
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(
        new AppError(
          "You are not logged in! Please log in to get access.",
          401,
        ),
      );
    }

    // 2. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Attach user payload to request
    // NOTE: Once the Prisma schema contains a User model, you should check if the user still exists:
    // const { prisma } = require('../config/db');
    // const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    // if (!currentUser) return next(new AppError('The user belonging to this token no longer exists.', 401));
    // req.user = currentUser;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || "user",
    };

    return next();
  } catch (error) {
    return next(error); // Caught by the global error handler (JsonWebTokenError, TokenExpiredError)
  }
};

/**
 * Authorization restriction helper.
 * Restricts access to specific user roles.
 *
 * @param {...string} roles - The roles allowed to access this route (e.g. 'admin', 'manager')
 */
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403),
      );
    }
    return next();
  };

module.exports = {
  protect,
  restrictTo,
  JWT_SECRET,
};
