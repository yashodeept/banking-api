const express = require("express");
const walletController = require("./wallet.controller");
const { authenticate } = require("../../shared/middlewares/auth.middleware");
const { authorize } = require("../../shared/middlewares/authorization.middleware");
const validate = require("../../shared/middlewares/validation.middleware");
const { createWalletSchema } = require("./wallet.validator");

const router = express.Router();

router.post(
  "/",
  authenticate,
  validate(createWalletSchema),
  walletController.createWallet,
);
router.get("/", authenticate, walletController.getWallet);

// Administrative freezing
router.patch(
  "/freeze",
  authenticate,
  authorize("ADMIN"),
  walletController.freezeWallet,
);
router.patch(
  "/unfreeze",
  authenticate,
  authorize("ADMIN"),
  walletController.unfreezeWallet,
);

// Close wallet
router.patch("/close", authenticate, walletController.closeWallet);

module.exports = router;
