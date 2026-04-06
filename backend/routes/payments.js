const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  createPayment,
  getPaymentStatus,
  fedaPayCallback,
} = require("../controllers/fedapayController");

const {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook,
} = require("../controllers/paymentController");

// Stripe
router.post("/create-intent", protect, createPaymentIntent);
router.post("/confirm", protect, confirmPayment);
router.post("/webhook", stripeWebhook);

// FedaPay (routes attendues par le frontend + compatibilité)
router.post("/fedapay/create", protect, createPayment);
router.get("/fedapay/status/:transactionId", protect, getPaymentStatus);
router.post("/fedapay/callback", fedaPayCallback);

// Anciennes routes (compat)
router.post("/fedapay", protect, createPayment);
router.get("/callback", fedaPayCallback);
module.exports = router;