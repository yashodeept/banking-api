const express = require("express");
const walletController = require("../../controllers/wallet.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/authorization.middleware");
const validate = require("../../middlewares/validation.middleware");
const { createWalletSchema } = require("../../validators/wallet.validator");

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
