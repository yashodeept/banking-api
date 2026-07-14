const jwt = require("jsonwebtoken");
const { JWT_CONFIG } = require("./constants");

const JWT_SECRET = process.env.JWT_SECRET || JWT_CONFIG.ACCESS_SECRET_DEFAULT;
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || JWT_CONFIG.REFRESH_SECRET_DEFAULT;

/**
 * Generates a short-lived Access Token.
 * @param {Object} payload - Token payload.
 * @returns {string} Signed JWT access token.
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_CONFIG.ACCESS_EXPIRY,
  });
}

/**
 * Generates a long-lived Refresh Token.
 * @param {Object} payload - Token payload.
 * @returns {string} Signed JWT refresh token.
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_CONFIG.REFRESH_EXPIRY,
  });
}

/**
 * Verifies an Access Token.
 * @param {string} token - The JWT token.
 * @returns {Object} Decoded payload.
 */
function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Verifies a Refresh Token.
 * @param {string} token - The JWT token.
 * @returns {Object} Decoded payload.
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
