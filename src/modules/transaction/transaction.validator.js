const { z } = require("zod");

const depositSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    description: z.string().optional(),
  }),
});

const withdrawSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    description: z.string().optional(),
  }),
});

const transferSchema = z.object({
  body: z.object({
    receiverWalletId: z.string().min(1, "Receiver Wallet ID is required"),
    amount: z.number().positive("Transfer amount must be greater than 0"),
    description: z.string().optional(),
  }),
});

module.exports = {
  depositSchema,
  withdrawSchema,
  transferSchema,
};
