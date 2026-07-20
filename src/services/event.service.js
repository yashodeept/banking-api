const { Queue } = require("bullmq");
const Redis = require("ioredis");

// Shared Redis connection
const connection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  },
);

class EventService {
  constructor() {
    // Queues
    this.paymentQueue = new Queue("payment-processing", { connection });
    this.webhookQueue = new Queue("webhook-dispatch", { connection });
    this.notificationQueue = new Queue("notification", { connection });
  }

  async publishPaymentEvent(eventName, payload) {
    console.log(`Publishing payment event: ${eventName}`);
    await this.paymentQueue.add(eventName, payload, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: true,
    });
  }

  async publishWebhookEvent(eventName, payload) {
    console.log(`Publishing webhook event: ${eventName}`);
    await this.webhookQueue.add(eventName, payload, {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: true,
    });
  }

  async publishNotificationEvent(eventName, payload) {
    console.log(`Publishing notification event: ${eventName}`);
    await this.notificationQueue.add(eventName, payload, {
      attempts: 3,
      backoff: {
        type: "fixed",
        delay: 1000,
      },
      removeOnComplete: true,
    });
  }
}

module.exports = new EventService();
