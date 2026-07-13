// 1. Load environment configurations first to ensure validation occurs before any imports
const env = require("./config/env");
const logger = require("./config/logger");
const { connectDb, prisma } = require("./config/db");
const app = require("./app");

let server;

/**
 * Handle server shutdown gracefully
 * @param {string} signal - The signal or event that initiated the shutdown
 * @param {Error} [err] - The error object if shutdown is due to an uncaught exception
 */
const gracefulShutdown = async (signal, err) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (err) {
    logger.error("Uncaught Error context:", err);
  }

  // Set a fallback timeout to force exit if graceful shutdown hangs
  const forceExitTimeout = setTimeout(() => {
    logger.warn("Graceful shutdown timed out. Forcing process exit.");
    process.exit(1);
  }, 10000); // 10 seconds

  if (server) {
    logger.info("Closing HTTP server...");
    await new Promise((resolve) => {
      server.close(() => {
        logger.info("HTTP server closed.");
        resolve();
      });
    });
  }

  try {
    logger.info("Disconnecting from database...");
    await prisma.$disconnect();
    logger.info("Database disconnected.");
  } catch (dbError) {
    logger.error("Error disconnecting database during shutdown:", dbError);
  }

  clearTimeout(forceExitTimeout);
  logger.info("Shutdown complete.");
  process.exit(err ? 1 : 0);
};

// Handle process-level errors
process.on("uncaughtException", (err) => {
  logger.error("CRITICAL: Uncaught Exception thrown!", err);
  gracefulShutdown("uncaughtException", err);
});

process.on("unhandledRejection", (reason) => {
  logger.error(
    "CRITICAL: Unhandled Promise Rejection detected!",
    reason instanceof Error ? reason : new Error(String(reason)),
  );
  gracefulShutdown(
    "unhandledRejection",
    reason instanceof Error ? reason : new Error(String(reason)),
  );
});

// Start application
async function bootstrap() {
  // Connect to Database
  await connectDb();

  // Start Express Server
  const PORT = env.PORT;
  server = app.listen(PORT, () => {
    logger.info(`🚀 Server running in [${env.NODE_ENV}] mode on port: ${PORT}`);
  });

  // Graceful shutdown signals
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

bootstrap().catch((error) => {
  logger.error("Failed to bootstrap application:", error);
  process.exit(1);
});
