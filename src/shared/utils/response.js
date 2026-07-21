/**
 * Sends a standardized success API response.
 * @param {Object} res - Express response object.
 * @param {string} message - Response message.
 * @param {Object|Array} data - Response payload.
 * @param {number} statusCode - HTTP status code (default: 200).
 */
function sendSuccess(res, message, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Sends a standardized error API response.
 * @param {Object} res - Express response object.
 * @param {string} message - Error message.
 * @param {Array} errors - Detailed errors or validation issues.
 * @param {number} statusCode - HTTP status code (default: 400).
 */
function sendError(res, message, errors = [], statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

module.exports = {
  sendSuccess,
  sendError,
};
