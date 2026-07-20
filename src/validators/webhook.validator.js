const { z } = require("zod");

const webhookSchema = z.object({
  body: z.object({
    paymentRef: z.string().min(1, "paymentRef is required"),
    status: z.enum(["SUCCESS", "FAILED"]),
    gatewayTransactionId: z.string().optional(),
  }),
});

module.exports = {
  webhookSchema,
};
