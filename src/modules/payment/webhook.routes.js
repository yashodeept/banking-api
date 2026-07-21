const express = require("express");
const router = express.Router();
const validate = require("../../shared/middlewares/validate");
const { webhookPayloadSchema } = require("./webhook.validator");
const paymentService = require("./payment.service");

// POST /webhooks/gateway - Listen for async payment gateway events
router.post(
  "/gateway",
  validate(webhookPayloadSchema),
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
