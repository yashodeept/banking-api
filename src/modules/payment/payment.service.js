const prisma = require("../../lib/prisma");
const paymentRepository = require("./payment.repository");
const transactionRepository = require("../transaction/transaction.repository");
const ledgerService = require("../ledger/ledger.service");
const eventService = require("../../shared/queues/event.service");
const crypto = require("crypto");
const Redis = require("ioredis");
const ConflictError = require("../../errors/ConflictError");
const BadRequestError = require("../../errors/BadRequestError");
const NotFoundError = require("../../errors/NotFoundError");

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

class PaymentService {
  _generatePaymentRef() {
    return "PAY-" + crypto.randomBytes(6).toString("hex").toUpperCase();
  }

  _generateTxRef() {
    return "TX-" + crypto.randomBytes(6).toString("hex").toUpperCase();
  }

  async processPayment(payload) {
    const {
      idempotencyKey,
      amount,
      method,
      receiverWalletId,
      createdBy,
      description,
    } = payload;

    if (!idempotencyKey) {
      throw new BadRequestError("Idempotency-Key is required");
    }

    // 1. Idempotency Check
    const cachedResponse = await redis.get(`idempotency:${idempotencyKey}`);
    if (cachedResponse) {
      return JSON.parse(cachedResponse);
    }

    // Ensure no concurrent duplicate processing
    const isLocked = await redis.set(
      `idempotency_lock:${idempotencyKey}`,
      "LOCKED",
      "NX",
      "EX",
      10,
    );
    if (!isLocked) {
      throw new ConflictError(
        "Request with this idempotency key is already processing",
      );
    }

    try {
      // 2. Atomic Transaction Block
      const result = await prisma.$transaction(async (tx) => {
        // Lock Wallet
        const wallets =
          await tx.$queryRaw`SELECT * FROM "Wallet" WHERE id = ${receiverWalletId} FOR UPDATE`;
        const wallet = wallets[0];

        if (!wallet) {
          throw new NotFoundError("Receiver Wallet not found");
        }
        if (wallet.status !== "ACTIVE") {
          throw new BadRequestError(
            `Wallet is ${wallet.status}. Active status required.`,
          );
        }
        if (amount <= 0) {
          throw new BadRequestError("Amount must be greater than zero");
        }

        // Initialize PENDING transaction
        let transaction = await transactionRepository.createTransaction(
          {
            transactionRef: this._generateTxRef(),
            type: "DEPOSIT", // Assuming payment is a deposit to the receiver wallet
            status: "SUCCESS",
            amount,
            description,
            receiverWalletId,
            createdBy,
          },
          tx,
        );

        // Update Balance & Ledger
        await ledgerService.postTransaction(
          {
            transactionId: transaction.id,
            walletId: receiverWalletId,
            entryType: "CREDIT",
            amount,
            currentBalance: wallet.balance,
          },
          tx,
        );

        // Write INITIATED payment record
        const payment = await paymentRepository.createPayment(
          {
            paymentRef: this._generatePaymentRef(),
            transactionId: transaction.id,
            amount,
            method,
            status: "INITIATED",
            idempotencyKey,
          },
          tx,
        );

        return { payment, transaction };
      });

      const responsePayload = result.payment;

      // Cache the successful response
      await redis.set(
        `idempotency:${idempotencyKey}`,
        JSON.stringify(responsePayload),
        "EX",
        86400,
      ); // 24 hours

      // 3. Publish Domain Event
      await eventService.publishPaymentEvent("PAYMENT_SUCCESS", {
        paymentId: result.payment.id,
        paymentRef: result.payment.paymentRef,
        amount: result.payment.amount,
        method: result.payment.method,
      });

      return responsePayload;
    } finally {
      // Release lock
      await redis.del(`idempotency_lock:${idempotencyKey}`);
    }
  }

  async verifyPayment(paymentRef, gatewayResponse) {
    const payment = await paymentRepository.findByReference(paymentRef);
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    // In a real-world scenario, you would parse the gateway response
    const status = gatewayResponse.success ? "SUCCESS" : "FAILED";

    const updatedPayment = await paymentRepository.updateStatus(
      payment.id,
      status,
    );
    await paymentRepository.updateGatewayResponse(payment.id, gatewayResponse);

    if (status === "SUCCESS") {
      await eventService.publishWebhookEvent("PAYMENT_VERIFIED", {
        paymentRef: payment.paymentRef,
        status: status,
      });
    }

    return updatedPayment;
  }
}

module.exports = new PaymentService();
