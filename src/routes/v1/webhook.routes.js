const express = require("express");
const router = express.Router();
const { validateRequest } = require("../../middlewares/validate");
const { webhookSchema } = require("../../validators/webhook.validator");
const paymentService = require("../../services/payment.service");

// POST /webhooks/payment - Ingest status callbacks from external payment partners
router.post(
  "/payment",
  validateRequest(webhookSchema),
  async (req, res, next) => {
    try {
      const { paymentRef, status, gatewayTransactionId } = req.body;

      // Simulate gateway response format
      const gatewayResponse = {
        success: status === "SUCCESS",
        gatewayTransactionId,
      };

      await paymentService.verifyPayment(paymentRef, gatewayResponse);

      res
        .status(200)
        .json({ success: true, message: "Webhook received and processed" });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
