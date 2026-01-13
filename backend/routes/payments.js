const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook,
} = require('../controllers/paymentController');
const {
  createFedapayPayment,
  checkFedapayStatus,
  fedapayCallback,
} = require('../controllers/fedapayController');

// Webhook Stripe (doit être avant express.json())
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Callback FedaPay (public, pas besoin d'authentification)
router.post('/fedapay/callback', fedapayCallback);

// Routes protégées
router.use(protect);

// Routes Stripe
router.post('/stripe/create-intent', authorize('client'), createPaymentIntent);
router.post('/stripe/confirm', authorize('client'), confirmPayment);

// Routes FedaPay
router.post('/fedapay/create', authorize('client'), createFedapayPayment);
router.get('/fedapay/status/:transactionId', checkFedapayStatus);

// Route de compatibilité (redirige vers FedaPay par défaut)
router.post('/create-payment', authorize('client'), createFedapayPayment);

module.exports = router;

