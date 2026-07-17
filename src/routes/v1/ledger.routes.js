const express = require("express");
const ledgerController = require("../../controllers/ledger.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/authorization.middleware");

const router = express.Router();

router.get("/", authenticate, authorize("ADMIN", "AUDITOR"), ledgerController.getWalletLedger.bind(ledgerController));
router.get("/:transactionRef", authenticate, authorize("ADMIN", "AUDITOR"), ledgerController.getTransactionLedgerEntries.bind(ledgerController));

module.exports = router;
