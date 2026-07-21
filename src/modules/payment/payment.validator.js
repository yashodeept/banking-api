const { z } = require("zod");

const createPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be greater than zero"),
    method: z.enum(["UPI", "BANK_TRANSFER", "CARD", "WALLET"]),
    receiverWalletId: z.string().cuid("Invalid receiver wallet ID"),
    description: z.string().optional(),
  }),
  headers: z
    .object({
      "idempotency-key": z
        .string()
        .min(1, "Idempotency-Key header is required"),
    })
    .passthrough(),
});

const verifyPaymentSchema = z.object({
  body: z.object({
    paymentRef: z.string().min(1, "paymentRef is required"),
    gatewayResponse: z
      .object({
        success: z.boolean(),
        gatewayTransactionId: z.string().optional(),
      })
      .passthrough(),
  }),
});

const retryPaymentSchema = z.object({
  body: z.object({
    paymentRef: z.string().min(1, "paymentRef is required"),
  }),
});

module.exports = {
  createPaymentSchema,
  verifyPaymentSchema,
  retryPaymentSchema,
};
