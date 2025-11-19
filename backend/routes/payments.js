const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook,
} = require('../controllers/paymentController');

// Webhook Stripe (doit être avant express.json())
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Routes protégées
router.use(protect);
router.post('/create-intent', authorize('client'), createPaymentIntent);
router.post('/confirm', authorize('client'), confirmPayment);

module.exports = router;

