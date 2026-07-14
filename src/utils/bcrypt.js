const bcrypt = require("bcryptjs");

/**
 * Hashes a plain text password.
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} The hashed password.
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plain text password with a hash.
 * @param {string} password - The plain text password.
 * @param {string} hashed - The stored hashed password.
 * @returns {Promise<boolean>} True if they match, false otherwise.
 */
async function comparePassword(password, hashed) {
  return bcrypt.compare(password, hashed);
}

module.exports = {
  hashPassword,
  comparePassword,
};
