const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { requestIdMiddleware } = require("./shared/middlewares/requestId.middleware");
const limiter = require("./shared/middlewares/rateLimiter.middleware");
const { prisma } = require("./shared/config/db");
const redisClient = require("./shared/config/redis");

const env = require("./shared/config/env");
const logger = require("./shared/config/logger");
const { setupSwagger } = require("./shared/config/swagger");
const apiRouter = require("./routes");
const globalErrorHandler = require("./shared/middlewares/error.middleware");

const app = express();

// 1. Trust proxy (needed if behind reverse proxy like Nginx/Heroku/Cloudflare for rate limiting)
app.set("trust proxy", 1);

// 2. Global Security Middlewares
app.use(helmet({ hidePoweredBy: true }));
app.use(
  cors({
    origin: env.NODE_ENV === "production" ? false : "*", // Strict CORS in production
    credentials: true,
  }),
);

// 3. Rate Limiter to prevent abuse on API endpoints
app.use("/api", limiter);

// 4. Request parsing and optimization
app.use(compression());
app.use(express.json({ limit: "10kb" })); // Limit body payload to protect against DOS
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(requestIdMiddleware);

// 5. Custom HTTP Request Logging (integrate Morgan with Winston)
const morganFormat = env.NODE_ENV === "development" ? "dev" : "combined";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }),
);

// 6. Mount API Swagger Documentation
setupSwagger(app);

// 7. Mount Core API Routes
app.use("/api", apiRouter);

// 8. Base & Health Check routes
app.get("/live", (req, res) => {
  res.status(200).json({ status: "UP", message: "Node runtime is responsive" });
});

app.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "UP", database: "UP" });
  } catch (error) {
    res.status(503).json({ status: "DOWN", database: "DOWN" });
  }
});

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const redisPing = await redisClient.ping();
    if (redisPing !== "PONG") throw new Error("Redis did not respond with PONG");
    
    res.status(200).json({
      status: "UP",
      database: "UP",
      redis: "UP",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Health check failed", error);
    res.status(503).json({
      status: "DOWN",
      message: error.message
    });
  }
});

// 9. Handle 404 Route Not Found
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// 10. Centralized Global Error Handler Middleware
app.use(globalErrorHandler);

module.exports = app;
