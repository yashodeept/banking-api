const { z } = require("zod");

const createWalletSchema = z.object({
  body: z.object({
    currency: z.string().length(3).optional().default("INR"),
  }),
});

module.exports = {
  createWalletSchema,
};
