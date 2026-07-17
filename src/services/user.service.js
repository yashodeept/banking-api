const userRepository = require("../repositories/user.repository");
const { hashPassword } = require("../utils/bcrypt");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");

class UserService {
  async getProfile(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return this._sanitizeUser(user);
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    
    // Prevent updating sensitive fields through this method
    delete updateData.password;
    delete updateData.role;
    delete updateData.status;
    delete updateData.isVerified;
    delete updateData.customerId;

    const updatedUser = await userRepository.updateProfile(userId, updateData);
    return this._sanitizeUser(updatedUser);
  }

  async changePassword(userId, newPassword) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const hashedPassword = await hashPassword(newPassword);
    await userRepository.changePassword(userId, hashedPassword);
    return { message: "Password updated successfully" };
  }

  async getAllUsers() {
    const users = await userRepository.getAllUsers();
    return users.map(this._sanitizeUser);
  }

  async changeStatus(adminUser, targetUserId, newStatus) {
    if (adminUser.role !== 'ADMIN') {
      throw new ForbiddenError("Only admins can change user status");
    }
    
    const user = await userRepository.findUserById(targetUserId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updatedUser = await userRepository.updateUserStatus(targetUserId, newStatus);
    return this._sanitizeUser(updatedUser);
  }

  async changeRole(adminUser, targetUserId, newRole) {
    if (adminUser.role !== 'ADMIN') {
      throw new ForbiddenError("Only admins can change user roles");
    }

    const user = await userRepository.findUserById(targetUserId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updatedUser = await userRepository.updateUserRole(targetUserId, newRole);
    return this._sanitizeUser(updatedUser);
  }

  async softDelete(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    await userRepository.softDeleteUser(userId);
    return { message: "User deleted successfully" };
  }

  _sanitizeUser(user) {
    if (!user) return null;
    const sanitized = { ...user };
    delete sanitized.password;
    delete sanitized.refreshToken;
    return sanitized;
  }
}

module.exports = new UserService();
