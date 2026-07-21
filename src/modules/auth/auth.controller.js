const { AuthService } = require("./auth.service");
const { sendSuccess } = require("../../shared/utils/response");

class AuthController {
  async register(req, res, next) {
    try {
      const { fullName, email, password } = req.body;
      const user = await AuthService.register({ fullName, email, password });
      return sendSuccess(res, "User registered successfully", user, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const session = await AuthService.login({ email, password });
      return sendSuccess(res, "Login successful", session, 200);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await AuthService.logout(userId);
      return sendSuccess(res, result.message, {}, 200);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const session = await AuthService.refreshAccessToken(refreshToken);
      return sendSuccess(res, "Token refreshed successfully", session, 200);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await AuthService.getProfile(userId);
      return sendSuccess(res, "Profile retrieved successfully", profile, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
