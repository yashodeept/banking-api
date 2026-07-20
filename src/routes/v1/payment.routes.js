const express = require("express");
const router = express.Router();
const paymentService = require("../../services/payment.service");
const paymentRepository = require("../../repositories/payment.repository");
const { validateRequest } = require("../../middlewares/validate");
const {
  createPaymentSchema,
  verifyPaymentSchema,
} = require("../../validators/payment.validator");
const { authenticate } = require("../../middlewares/auth");

// POST /payments - Initialize transaction request
router.post(
  "/",
  authenticate,
  validateRequest(createPaymentSchema),
  async (req, res, next) => {
    try {
      const payload = {
        ...req.body,
        createdBy: req.user.id,
        idempotencyKey: req.headers["idempotency-key"],
      };

      const payment = await paymentService.processPayment(payload);
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  },
);

// POST /payments/verify - Reconcile gateway hooks
router.post(
  "/verify",
  authenticate,
  validateRequest(verifyPaymentSchema),
  async (req, res, next) => {
    try {
      const { paymentRef, gatewayResponse } = req.body;
      const payment = await paymentService.verifyPayment(
        paymentRef,
        gatewayResponse,
      );
      res.json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  },
);

// POST /payments/retry - Re-trigger a failed payment attempt
router.post("/retry", authenticate, async (req, res, next) => {
  try {
    // In a real application, you would implement retry logic.
    // For now, we can just return a not-implemented or simulated response.
    res.json({ success: true, message: "Retry initiated" });
  } catch (error) {
    next(error);
  }
});

// GET /payments - Fetch personal history log
router.get("/", authenticate, async (req, res, next) => {
  try {
    const payments = await paymentRepository.findPaymentsByUser(req.user.id);
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});

// GET /payments/:reference - Fetch specific transaction record
router.get("/:reference", authenticate, async (req, res, next) => {
  try {
    const payment = await paymentRepository.findByReference(
      req.params.reference,
    );
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    // Authorization check to ensure the user owns the payment could be added here
    if (
      payment.transaction.createdBy !== req.user.id &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
