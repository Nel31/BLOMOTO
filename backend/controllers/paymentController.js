const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Appointment = require('../models/Appointment');

// @desc    Créer une intention de paiement
// @route   POST /api/payments/create-intent
// @access  Private/Client
exports.createPaymentIntent = async (req, res) => {
  try {
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Paiement non configuré. Configurez STRIPE_SECRET_KEY dans votre .env' });
    }

    const { appointmentId, amount } = req.body;

    // Vérifier que le rendez-vous appartient au client
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    if (appointment.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Créer l'intention de paiement Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir en centimes
      currency: 'eur',
      metadata: {
        appointmentId: appointmentId.toString(),
        userId: req.user._id.toString(),
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirmer un paiement réussi
// @route   POST /api/payments/confirm
// @access  Private/Client
exports.confirmPayment = async (req, res) => {
  try {
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Paiement non configuré' });
    }

    const { paymentIntentId, appointmentId } = req.body;

    // Vérifier le paiement avec Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Paiement non réussi' });
    }

    // Mettre à jour le rendez-vous avec le statut de paiement
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        paymentStatus: 'paid',
        paymentIntentId: paymentIntentId,
      },
      { new: true }
    );

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Webhook Stripe pour les événements de paiement
// @route   POST /api/payments/webhook
// @access  Public (signé par Stripe)
exports.stripeWebhook = async (req, res) => {
  if (!stripe || !process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ message: 'Stripe non configuré' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).json({ message: 'STRIPE_WEBHOOK_SECRET non configuré' });
    }

    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer l'événement
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const appointmentId = paymentIntent.metadata.appointmentId;

    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        paymentStatus: 'paid',
        paymentIntentId: paymentIntent.id,
      });
    }
  }

  res.json({ received: true });
};

