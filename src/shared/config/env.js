const dotenv = require("dotenv");
const { z } = require("zod");

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment variables:");
  result.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

const env = Object.freeze(result.data);

module.exports = env;
