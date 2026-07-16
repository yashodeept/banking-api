const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const logger = require("./config/logger");
const { setupSwagger } = require("./config/swagger");
const apiRouter = require("./routes");
const globalErrorHandler = require("./middlewares/errorHandler");

const app = express();

// 1. Trust proxy (needed if behind reverse proxy like Nginx/Heroku/Cloudflare for rate limiting)
app.set("trust proxy", 1);

// 2. Global Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.NODE_ENV === "production" ? false : "*", // Strict CORS in production
    credentials: true,
  }),
);

// 3. Rate Limiter to prevent abuse on API endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: 429,
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
  },
});
app.use("/api", limiter);

// 4. Request parsing and optimization
app.use(compression());
app.use(express.json({ limit: "10kb" })); // Limit body payload to protect against DOS
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

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
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
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
