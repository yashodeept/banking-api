const userService = require("../services/user.service");

class UserController {
  async getMe(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req, res, next) {
    try {
      const updatedUser = await userService.updateProfile(req.user.id, req.body);
      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const result = await userService.changePassword(req.user.id, req.body.newPassword);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async deleteMe(req, res, next) {
    try {
      const result = await userService.softDelete(req.user.id);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async changeStatus(req, res, next) {
    try {
      const updatedUser = await userService.changeStatus(req.user, req.params.id, req.body.status);
      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async changeRole(req, res, next) {
    try {
      const updatedUser = await userService.changeRole(req.user, req.params.id, req.body.role);
      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
