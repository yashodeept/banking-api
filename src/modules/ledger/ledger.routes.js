const express = require("express");
const ledgerController = require("./ledger.controller");
const { authenticate } = require("../../shared/middlewares/auth.middleware");
const { authorize } = require("../../shared/middlewares/authorization.middleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "AUDITOR"),
  ledgerController.getWalletLedger.bind(ledgerController),
);
router.get(
  "/:transactionRef",
  authenticate,
  authorize("ADMIN", "AUDITOR"),
  ledgerController.getTransactionLedgerEntries.bind(ledgerController),
);

module.exports = router;
