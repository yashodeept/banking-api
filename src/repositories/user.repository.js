const prisma = require("../lib/prisma");

/**
 * Creates a new user in the database.
 * @param {Object} data - The user details.
 * @returns {Promise<Object>} The created user record.
 */
async function createUser(data) {
  return prisma.user.create({
    data,
  });
}

/**
 * Finds a user by their unique email.
 * @param {string} email - The email to search for.
 * @returns {Promise<Object|null>} The user record or null if not found.
 */
async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Finds a user by their unique ID.
 * @param {string} id - The user ID.
 * @returns {Promise<Object|null>} The user record or null if not found.
 */
async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Finds a user by their active refresh token.
 * @param {string} token - The refresh token.
 * @returns {Promise<Object|null>} The user record or null if not found.
 */
async function findUserByRefreshToken(token) {
  return prisma.user.findFirst({
    where: { refreshToken: token },
  });
}

/**
 * Updates the refresh token for a user.
 * @param {string} userId - The user ID.
 * @param {string} token - The new refresh token.
 * @returns {Promise<Object>} The updated user record.
 */
async function updateRefreshToken(userId, token) {
  return prisma.user.update({
    where: { id: userId },
    data: { refreshToken: token },
  });
}

/**
 * Clears/nullifies the refresh token for a user.
 * @param {string} userId - The user ID.
 * @returns {Promise<Object>} The updated user record.
 */
async function deleteRefreshToken(userId) {
  return prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
}

async function findUserByCustomerId(customerId) {
  return prisma.user.findUnique({
    where: { customerId },
  });
}

async function updateProfile(id, data) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

async function changePassword(id, hashedPassword) {
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });
}

async function updateUserStatus(id, status) {
  return prisma.user.update({
    where: { id },
    data: { status },
  });
}

async function updateUserRole(id, role) {
  return prisma.user.update({
    where: { id },
    data: { role },
  });
}

async function getAllUsers() {
  return prisma.user.findMany();
}

async function softDeleteUser(id) {
  return prisma.user.update({
    where: { id },
    data: { status: "INACTIVE" },
  });
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByRefreshToken,
  updateRefreshToken,
  deleteRefreshToken,
  findUserByCustomerId,
  updateProfile,
  changePassword,
  updateUserStatus,
  updateUserRole,
  getAllUsers,
  softDeleteUser,
};
