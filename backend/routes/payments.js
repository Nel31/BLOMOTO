const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook,
} = require('../controllers/paymentController');
const {
  createKkiapayPayment,
  checkKkiapayStatus,
  kkiapayCallback,
} = require('../controllers/kkiapayController');

// Webhook Stripe (doit être avant express.json())
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Callback KKIAPAY (public, pas besoin d'authentification)
router.post('/kkiapay/callback', kkiapayCallback);

// Routes protégées
router.use(protect);

// Routes Stripe
router.post('/stripe/create-intent', authorize('client'), createPaymentIntent);
router.post('/stripe/confirm', authorize('client'), confirmPayment);

// Routes KKIAPAY
router.post('/kkiapay/create', authorize('client'), createKkiapayPayment);
router.get('/kkiapay/status/:transactionId', checkKkiapayStatus);

// Route de compatibilité (redirige vers KKIAPAY par défaut)
router.post('/create-payment', authorize('client'), createKkiapayPayment);

module.exports = router;

