const express = require("express");
const authRoutes = require("./modules/auth/auth.routes");
const accountRoutes = require("./modules/wallet/account.routes");
const transactionRoutes = require("./modules/transaction/transaction.routes");
const userRoutes = require("./modules/user/user.routes");
const walletRoutes = require("./modules/wallet/wallet.routes");
const ledgerRoutes = require("./modules/ledger/ledger.routes");
const paymentRoutes = require("./modules/payment/payment.routes");
const auditRoutes = require("./modules/audit/audit.routes");
const webhookRoutes = require("./modules/payment/webhook.routes");

const router = express.Router();

// Mount v1 routes
router.use("/v1/auth", authRoutes);
router.use("/v1/accounts", accountRoutes);
router.use("/v1/transactions", transactionRoutes);
router.use("/v1/users", userRoutes);
router.use("/v1/wallet", walletRoutes);
router.use("/v1/ledger", ledgerRoutes);
router.use("/v1/payments", paymentRoutes);
router.use("/v1/audit", auditRoutes);
router.use("/v1/webhooks", webhookRoutes);

module.exports = router;
