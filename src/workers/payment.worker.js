const { Worker } = require("bullmq");
const Redis = require("ioredis");
const paymentRepository = require("../repositories/payment.repository");

const connection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  },
);

const paymentWorker = new Worker(
  "payment-processing",
  async (job) => {
    console.log(`Processing payment job ${job.id} for event ${job.name}`);
    const { paymentId, paymentRef } = job.data;

    try {
      if (job.name === "PAYMENT_SUCCESS") {
        // Simulate network-heavy third-party sync or background work
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log(`Payment sync complete for ${paymentRef}`);

        // We update the status to SUCCESS after background processing confirms it
        await paymentRepository.updateStatus(paymentId, "SUCCESS");
      }
    } catch (error) {
      console.error(`Failed to process payment job ${job.id}:`, error);
      throw error; // Let BullMQ handle retries and move to DLQ if max attempts reached
    }
  },
  { connection },
);

paymentWorker.on("completed", (job) => {
  console.log(`Payment Job ${job.id} has completed!`);
});

paymentWorker.on("failed", (job, err) => {
  console.log(`Payment Job ${job.id} has failed with ${err.message}`);
});

module.exports = paymentWorker;
