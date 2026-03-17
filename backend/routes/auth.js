const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Créer une intention de paiement
router.post("/create-intent", protect, createPaymentIntent);

// Confirmer un paiement
router.post("/confirm", protect, confirmPayment);

// Webhook Stripe (public)
router.post("/webhook", stripeWebhook);

module.exports = router;