const { z } = require("zod");

const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),
    phone: z.string().min(10).max(15).optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
  }),
});

const changeStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED", "LOCKED"]),
  }),
});

const changeRoleSchema = z.object({
  body: z.object({
    role: z.enum(["ADMIN", "CUSTOMER", "BANK", "SUPPORT", "AUDITOR"]),
  }),
});

module.exports = {
  updateProfileSchema,
  changePasswordSchema,
  changeStatusSchema,
  changeRoleSchema,
};
