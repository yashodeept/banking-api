const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default;
const redisClient = require("../config/redis");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

module.exports = limiter;
