const { PrismaClient } = require("@prisma/client");
const logger = require("./logger");
const env = require("./env");

let prisma;

if (
  env.DATABASE_URL.startsWith("postgres://") ||
  env.DATABASE_URL.startsWith("postgresql://")
) {
  // Use Driver Adapter for direct TCP PostgreSQL connection in Prisma v7
  const { Pool } = require("pg");
  const { PrismaPg } = require("@prisma/adapter-pg");

  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  prisma = new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development"
        ? [
            { level: "query", emit: "event" },
            { level: "info", emit: "stdout" },
            { level: "warn", emit: "stdout" },
            { level: "error", emit: "stdout" },
          ]
        : [
            { level: "info", emit: "stdout" },
            { level: "warn", emit: "stdout" },
            { level: "error", emit: "stdout" },
          ],
  });
} else {
  // Use serverless connection for prisma+postgres://
  prisma = new PrismaClient({
    accelerateUrl: env.DATABASE_URL,
    log:
      env.NODE_ENV === "development"
        ? [
            { level: "query", emit: "event" },
            { level: "info", emit: "stdout" },
            { level: "warn", emit: "stdout" },
            { level: "error", emit: "stdout" },
          ]
        : [
            { level: "info", emit: "stdout" },
            { level: "warn", emit: "stdout" },
            { level: "error", emit: "stdout" },
          ],
  });
}

if (env.NODE_ENV === "development") {
  prisma.$on("query", (e) => {
    logger.debug(
      `Prisma Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`,
    );
  });
}

/**
 * Verify database connection
 */
async function connectDb() {
  try {
    await prisma.$connect();
    logger.info("🔌 Database connection established successfully.");
  } catch (error) {
    logger.error("❌ Failed to connect to the database:", error);
    process.exit(1);
  }
}

module.exports = {
  prisma,
  connectDb,
};
