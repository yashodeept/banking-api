/**
 * Custom application error class to handle operational errors.
 * Operational errors are expected runtime errors (e.g. invalid input, resource not found, unauthorized, etc.)
 * as opposed to programming errors/bugs (e.g. undefined reference, type mismatch, memory leaks).
 */
class AppError extends Error {
  /**
   * @param {string} message - Error description message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // Capture the stack trace, keeping the constructor call out of it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
