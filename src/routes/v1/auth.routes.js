const express = require("express");
const authController = require("../../controllers/auth.controller");
const validate = require("../../middlewares/validation.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} = require("../../validators/auth.validator");

const router = express.Router();

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken,
);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.get("/profile", authenticate, authController.getProfile);

module.exports = router;
