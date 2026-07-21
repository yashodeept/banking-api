const express = require("express");
const { z } = require("zod");
const validate = require("../../shared/middlewares/validate");
const { authenticate } = require("../../shared/middlewares/auth.middleware");

const router = express.Router();

const createAccountSchema = {
  body: z.object({
    type: z.enum(["checking", "savings"], {
      errorMap: () => ({ message: "Account type must be checking or savings" }),
    }),
    initialDeposit: z
      .number()
      .nonnegative("Initial deposit must be at least 0"),
  }),
};

const getAccountSchema = {
  params: z.object({
    accountId: z.string().min(1, "Account ID is required"),
  }),
};

/**
 * @openapi
 * tags:
 *   name: Accounts
 *   description: Bank accounts management
 */

/**
 * @openapi
 * /api/v1/accounts:
 *   post:
 *     summary: Create a new bank account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - initialDeposit
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [checking, savings]
 *                 example: savings
 *               initialDeposit:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       201:
 *         description: Account created successfully.
 */
router.post("/", authenticate, validate(createAccountSchema), (req, res) => {
  const { type, initialDeposit } = req.body;
  const accountNumber =
    "ACC-" + Math.floor(1000000000 + Math.random() * 9000000000);
  const accountId = "acc_" + Math.random().toString(36).substr(2, 9);

  res.status(201).json({
    status: "success",
    data: {
      account: {
        id: accountId,
        accountNumber,
        type,
        balance: initialDeposit,
        userId: req.user.id,
        createdAt: new Date().toISOString(),
      },
    },
  });
});

/**
 * @openapi
 * /api/v1/accounts:
 *   get:
 *     summary: Get all accounts for logged-in user
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accounts.
 */
router.get("/", authenticate, (req, res) => {
  res.status(200).json({
    status: "success",
    results: 1,
    data: {
      accounts: [
        {
          id: "acc_mock_5678",
          accountNumber: "ACC-9876543210",
          type: "checking",
          balance: 2500.5,
          userId: req.user.id,
          createdAt: new Date().toISOString(),
        },
      ],
    },
  });
});

/**
 * @openapi
 * /api/v1/accounts/{accountId}:
 *   get:
 *     summary: Get account details by ID
 *     tags: [Accounts]
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
 *         description: Account details.
 */
router.get("/:accountId", authenticate, validate(getAccountSchema), (req, res) => {
  const { accountId } = req.params;

  res.status(200).json({
    status: "success",
    data: {
      account: {
        id: accountId,
        accountNumber: "ACC-9876543210",
        type: "checking",
        balance: 2500.5,
        userId: req.user.id,
        createdAt: new Date().toISOString(),
      },
    },
  });
});

module.exports = router;
