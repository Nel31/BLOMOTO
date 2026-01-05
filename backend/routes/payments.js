// const express = require('express');
// const router = express.Router();
// const { protect, authorize } = require('../middleware/auth');
// const {
//   createPaymentIntent,
//   confirmPayment,
//   stripeWebhook,
// } = require('../controllers/paymentController');

// // Webhook Stripe (doit être avant express.json())
// router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// // Routes protégées
// router.use(protect);
// router.post('/create-intent', authorize('client'), createPaymentIntent);
// router.post('/confirm', authorize('client'), confirmPayment);

// module.exports = router;

// backend/routes/payment.js

const express = require('express');
const router = express.Router();
const axios = require('axios');

const KKIAPAY_SECRET_KEY = process.env.KKIAPAY_SECRET_KEY;

router.post('/create-payment', async (req, res) => {
    const { amount, currency, customerEmail } = req.body;

    try {
        const response = await axios.post('https://api.kkiapay.me/v1/transactions', {
            amount,
            currency,
            customer_email: customerEmail,
            callback_url: 'http://localhost:5173/payment-callback',
        }, {
            headers: {
                'Authorization': `Bearer ${KKIAPAY_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la création du paiement' });
    }
});

module.exports = router;

