const { Worker } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  },
);

const webhookWorker = new Worker(
  "webhook-dispatch",
  async (job) => {
    console.log(`Processing webhook job ${job.id} for event ${job.name}`);
    const { paymentRef, status } = job.data;

    try {
      if (job.name === "PAYMENT_VERIFIED") {
        // Simulate dispatching a webhook to an external partner
        console.log(
          `Dispatching webhook for payment ${paymentRef} with status ${status}`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`Webhook successfully dispatched for ${paymentRef}`);
      }
    } catch (error) {
      console.error(`Failed to process webhook job ${job.id}:`, error);
      throw error;
    }
  },
  { connection },
);

webhookWorker.on("completed", (job) => {
  console.log(`Webhook Job ${job.id} has completed!`);
});

webhookWorker.on("failed", (job, err) => {
  console.log(`Webhook Job ${job.id} has failed with ${err.message}`);
});

module.exports = webhookWorker;
