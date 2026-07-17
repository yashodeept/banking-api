const express = require("express");
const transactionController = require("../../controllers/transaction.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validation.middleware");
const { depositSchema, withdrawSchema, transferSchema } = require("../../validators/transaction.validator");

const router = express.Router();

router.post("/deposit", authenticate, validate(depositSchema), transactionController.deposit.bind(transactionController));
router.post("/withdraw", authenticate, validate(withdrawSchema), transactionController.withdraw.bind(transactionController));
router.post("/transfer", authenticate, validate(transferSchema), transactionController.transfer.bind(transactionController));
router.get("/", authenticate, transactionController.getHistory.bind(transactionController));
router.get("/:reference", authenticate, transactionController.getTransactionDetails.bind(transactionController));

module.exports = router;
