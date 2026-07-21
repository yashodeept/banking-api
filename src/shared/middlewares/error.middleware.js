const AppError = require("../../errors/AppError");
const BadRequestError = require("../../errors/BadRequestError");
const ConflictError = require("../../errors/ConflictError");
const NotFoundError = require("../../errors/NotFoundError");
const UnauthorizedError = require("../../errors/UnauthorizedError");
const logger = require("../config/logger");

// Global Exception Interceptor
const errorMiddleware = (err, req, res, _next) => {
  let error = err;

  // Prisma Mappings
  if (err.code === "P2002") {
    error = new ConflictError("Resource already exists");
  } else if (err.code === "P2025") {
    error = new NotFoundError("Record not found");
  } else if (err.code === "P2003") {
    error = new BadRequestError("Foreign key constraint failed");
  }

  // JWT Mappings
  if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
    const message =
      err.name === "TokenExpiredError"
        ? "Access token has expired"
        : "Invalid access token";
    error = new UnauthorizedError(message);
  }

  // Evaluate Error Operational Context
  let statusCode = 500;
  let errorCode = "INTERNAL_SERVER_ERROR";
  let message = "Internal Server Error";
  let details = [];

  if (error instanceof AppError && error.isOperational) {
    statusCode = error.statusCode;
    errorCode = error.errorCode;
    message = error.message;
    if (error.details) {
      details = error.details;
    }
  } else {
    // Non-operational error (e.g. native runtime failure)
    // Mask unexpected runtime errors behind a generic 500 Internal Server Error message
    // ensuring full stack logs trace to the internal stdout/logger.
    logger.error(`[Non-Operational Error] ${err.message || "Unknown Error"}`, {
      stack: err.stack,
    });
  }

  // Format Standardized Payload Output
  const payload = {
    success: false,
    message: message,
    error: {
      code: errorCode,
      details: details,
    },
  };

  // Conditional Rule: Append a stack property into the JSON payload only if process.env.NODE_ENV !== 'production'
  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;

    // Optional dev quality-of-life: expose the raw error message if it wasn't operational
    if (!(error instanceof AppError && error.isOperational)) {
      payload.message = err.message || message;
    }
  }

  res.status(statusCode).json(payload);
};

module.exports = errorMiddleware;
