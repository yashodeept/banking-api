const env = require("../config/env");
const logger = require("../config/logger");
const AppError = require("../utils/AppError");

/**
 * Handle Prisma Database Constraint Errors (e.g., unique constraints)
 */
const handlePrismaUniqueConstraintError = (err) => {
  const fields = err.meta?.target || [];
  const message = `Duplicate field value for [${fields.join(", ")}]. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handle Prisma Database Record Not Found Errors
 */
const handlePrismaRecordNotFoundError = (err) => {
  const message = err.meta?.cause || "Record not found in the database.";
  return new AppError(message, 404);
};

/**
 * Handle Zod Validation Schema Validation Errors
 */
const handleZodValidationError = (err) => {
  const errors = err.issues.map((el) => ({
    field: el.path.join("."),
    message: el.message,
  }));
  const message = "Invalid input data.";

  const appError = new AppError(message, 400);
  appError.errors = errors; // Attach structured errors
  return appError;
};

/**
 * Handle JSON Web Token (JWT) Signature Validation Errors
 */
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

/**
 * Handle JSON Web Token (JWT) Expiration Errors
 */
const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

/**
 * Send detailed error payloads in development
 */
const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    statusCode: err.statusCode,
    message: err.message,
    errors: err.errors,
    stack: err.stack,
    error: err,
  });
};

/**
 * Send simplified/masked error payloads in production
 */
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      ...(err.errors && { errors: err.errors }), // Include Zod details if present
    });
  } else {
    // Programming or other unknown error: don't leak details to client
    logger.error("ERROR 💥:", err);

    res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "Something went very wrong on the server!",
    });
  }
};

/**
 * Global Express Error Handling Middleware
 */
module.exports = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (env.NODE_ENV === "development") {
    // In development, handle specific error mappings but preserve rich stacks
    let error = { ...err, message: err.message, stack: err.stack };

    if (err.name === "ZodError") error = handleZodValidationError(err);
    if (err.code === "P2002") error = handlePrismaUniqueConstraintError(err);
    if (err.code === "P2025") error = handlePrismaRecordNotFoundError(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorDev(error, req, res);
  } else if (env.NODE_ENV === "production") {
    let error = { ...err, message: err.message };

    // Format specific errors to AppError in production
    if (err.name === "ZodError") error = handleZodValidationError(err);
    if (err.code === "P2002") error = handlePrismaUniqueConstraintError(err);
    if (err.code === "P2025") error = handlePrismaRecordNotFoundError(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
