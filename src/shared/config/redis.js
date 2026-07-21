const Redis = require("ioredis");
const env = require("./env");

const redisClient = new Redis(env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

module.exports = redisClient;
