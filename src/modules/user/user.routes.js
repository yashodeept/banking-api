const express = require("express");
const userController = require("./user.controller");
const { authenticate } = require("../../shared/middlewares/auth.middleware");
const { authorize } = require("../../shared/middlewares/authorization.middleware");
const validate = require("../../shared/middlewares/validation.middleware");
const {
  updateProfileSchema,
  changePasswordSchema,
  changeStatusSchema,
  changeRoleSchema,
} = require("./user.validator");

const router = express.Router();

// Self-service endpoints
router.get("/me", authenticate, userController.getMe);
router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  userController.updateMe,
);
router.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  userController.changePassword,
);
router.delete("/me", authenticate, userController.deleteMe);

// Administrative endpoints
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "AUDITOR"),
  userController.getAllUsers,
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  validate(changeStatusSchema),
  userController.changeStatus,
);
router.patch(
  "/:id/role",
  authenticate,
  authorize("ADMIN"),
  validate(changeRoleSchema),
  userController.changeRole,
);

module.exports = router;
