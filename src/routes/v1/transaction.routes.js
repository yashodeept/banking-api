const express = require("express");
const { z } = require("zod");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/auth");

const router = express.Router();

const transferSchema = {
  body: z.object({
    fromAccountId: z.string().min(1, "Sender account ID is required"),
    toAccountId: z.string().min(1, "Recipient account ID is required"),
    amount: z.number().positive("Transfer amount must be greater than 0"),
    description: z.string().optional(),
  }),
};

const depositWithdrawSchema = {
  body: z.object({
    accountId: z.string().min(1, "Account ID is required"),
    amount: z.number().positive("Amount must be greater than 0"),
    description: z.string().optional(),
  }),
};

const getHistorySchema = {
  params: z.object({
    accountId: z.string().min(1, "Account ID is required"),
  }),
};

/**
 * @openapi
 * tags:
 *   name: Transactions
 *   description: Bank transactions and transfers management
 */

/**
 * @openapi
 * /api/v1/transactions/transfer:
 *   post:
 *     summary: Transfer funds between accounts
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromAccountId
 *               - toAccountId
 *               - amount
 *             properties:
 *               fromAccountId:
 *                 type: string
 *                 example: acc_sender123
 *               toAccountId:
 *                 type: string
 *                 example: acc_recipient456
 *               amount:
 *                 type: number
 *                 example: 250
 *               description:
 *                 type: string
 *                 example: Rent payment
 *     responses:
 *       200:
 *         description: Transfer completed successfully.
 */
router.post("/transfer", protect, validate(transferSchema), (req, res) => {
  const { fromAccountId, toAccountId, amount, description } = req.body;
  const transactionId = "tx_" + Math.random().toString(36).substr(2, 9);

  res.status(200).json({
    status: "success",
    data: {
      transaction: {
        id: transactionId,
        type: "transfer",
        amount,
        description: description || "Fund transfer",
        fromAccountId,
        toAccountId,
        createdAt: new Date().toISOString(),
      },
    },
  });
});

/**
 * @openapi
 * /api/v1/transactions/deposit:
 *   post:
 *     summary: Deposit funds into an account
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - amount
 *             properties:
 *               accountId:
 *                 type: string
 *                 example: acc_savings789
 *               amount:
 *                 type: number
 *                 example: 500
 *               description:
 *                 type: string
 *                 example: Cash deposit
 *     responses:
 *       200:
 *         description: Deposit completed successfully.
 */
router.post(
  "/deposit",
  protect,
  validate(depositWithdrawSchema),
  (req, res) => {
    const { accountId, amount, description } = req.body;
    const transactionId = "tx_" + Math.random().toString(36).substr(2, 9);

    res.status(200).json({
      status: "success",
      data: {
        transaction: {
          id: transactionId,
          type: "deposit",
          amount,
          description: description || "Deposit",
          accountId,
          createdAt: new Date().toISOString(),
        },
      },
    });
  },
);

/**
 * @openapi
 * /api/v1/transactions/withdraw:
 *   post:
 *     summary: Withdraw funds from an account
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - amount
 *             properties:
 *               accountId:
 *                 type: string
 *                 example: acc_checking012
 *               amount:
 *                 type: number
 *                 example: 100
 *               description:
 *                 type: string
 *                 example: ATM withdrawal
 *     responses:
 *       200:
 *         description: Withdrawal completed successfully.
 */
router.post(
  "/withdraw",
  protect,
  validate(depositWithdrawSchema),
  (req, res) => {
    const { accountId, amount, description } = req.body;
    const transactionId = "tx_" + Math.random().toString(36).substr(2, 9);

    res.status(200).json({
      status: "success",
      data: {
        transaction: {
          id: transactionId,
          type: "withdrawal",
          amount,
          description: description || "Withdrawal",
          accountId,
          createdAt: new Date().toISOString(),
        },
      },
    });
  },
);

/**
 * @openapi
 * /api/v1/transactions/{accountId}:
 *   get:
 *     summary: Get transaction history for an account
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID
 *     responses:
 *       200:
 *         description: List of transactions.
 */
router.get("/:accountId", protect, validate(getHistorySchema), (req, res) => {
  const { accountId } = req.params;

  res.status(200).json({
    status: "success",
    results: 1,
    data: {
      transactions: [
        {
          id: "tx_mock_1111",
          type: "deposit",
          amount: 1000,
          description: "Salary deposit",
          accountId,
          createdAt: new Date().toISOString(),
        },
      ],
    },
  });
});

module.exports = router;
