const express = require("express");
const transactionController = require("./transaction.controller");
const { authenticate } = require("../../shared/middlewares/auth.middleware");
const validate = require("../../shared/middlewares/validation.middleware");
const {
  depositSchema,
  withdrawSchema,
  transferSchema,
} = require("./transaction.validator");

const router = express.Router();

router.post(
  "/deposit",
  authenticate,
  validate(depositSchema),
  transactionController.deposit.bind(transactionController),
);
router.post(
  "/withdraw",
  authenticate,
  validate(withdrawSchema),
  transactionController.withdraw.bind(transactionController),
);
router.post(
  "/transfer",
  authenticate,
  validate(transferSchema),
  transactionController.transfer.bind(transactionController),
);
router.get(
  "/",
  authenticate,
  transactionController.getHistory.bind(transactionController),
);
router.get(
  "/:reference",
  authenticate,
  transactionController.getTransactionDetails.bind(transactionController),
);

module.exports = router;
