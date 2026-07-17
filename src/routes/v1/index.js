const express = require("express");
const authRoutes = require("./auth.routes");
const accountRoutes = require("./account.routes");
const transactionRoutes = require("./transaction.routes");
const userRoutes = require("./user.routes");
const walletRoutes = require("./wallet.routes");
const ledgerRoutes = require("./ledger.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/accounts", accountRoutes);
router.use("/transactions", transactionRoutes);
router.use("/users", userRoutes);
router.use("/wallet", walletRoutes);
router.use("/ledger", ledgerRoutes);

module.exports = router;
