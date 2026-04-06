const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');

// @desc    Créer une intention de paiement
// @route   POST /api/payments/create-intent
// @access  Private/Client
async function createPaymentIntent (req, res) {
  try {
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Paiement non configuré. Configurez STRIPE_SECRET_KEY dans votre .env' });
    }

    const { appointmentId, invoiceId, amount } = req.body;

    if (!appointmentId && !invoiceId) {
      return res.status(400).json({ message: 'appointmentId ou invoiceId requis' });
    }

    // Vérifier que la ressource appartient au client
    let appointment = null;
    let invoice = null;

    if (invoiceId) {
      invoice = await Invoice.findById(invoiceId);
      if (!invoice) return res.status(404).json({ message: 'Facture non trouvée' });
      if (invoice.clientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Non autorisé' });
      }
      if (invoice.status === 'paid') {
        return res.status(400).json({ message: 'Facture déjà payée' });
      }
    } else {
      appointment = await Appointment.findById(appointmentId);
      if (!appointment) return res.status(404).json({ message: 'Rendez-vous non trouvé' });
      if (appointment.clientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Non autorisé' });
      }
    }

    // Créer l'intention de paiement Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      // XOF est une devise sans décimales: amount doit être un entier
      amount: Math.round(amount),
      currency: 'xof',
      metadata: {
        ...(appointmentId ? { appointmentId: appointmentId.toString() } : {}),
        ...(invoiceId ? { invoiceId: invoiceId.toString() } : {}),
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
async function confirmPayment(req, res) {
  try {
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Paiement non configuré' });
    }

    const { paymentIntentId, appointmentId, invoiceId } = req.body;
    if (!appointmentId && !invoiceId) {
      return res.status(400).json({ message: 'appointmentId ou invoiceId requis' });
    }

    // Vérifier le paiement avec Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Paiement non réussi' });
    }

    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) return res.status(404).json({ message: 'Facture non trouvée' });
      if (invoice.clientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      invoice.status = 'paid';
      invoice.paidAmount = invoice.total;
      invoice.paidAt = new Date();
      invoice.paymentMethod = 'card';
      await invoice.save();

      // Si lié à un rendez-vous, le marquer payé aussi
      if (invoice.appointmentId) {
        await Appointment.findByIdAndUpdate(invoice.appointmentId, {
          paymentStatus: 'paid',
          paymentIntentId: paymentIntentId,
        });
      }

      return res.json({ success: true, invoice });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { paymentStatus: 'paid', paymentIntentId: paymentIntentId },
      { new: true }
    );

    return res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Webhook Stripe pour les événements de paiement
// @route   POST /api/payments/webhook
// @access  Public (signé par Stripe)
async function stripeWebhook(req, res) {
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
    const invoiceId = paymentIntent.metadata.invoiceId;

    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        paymentStatus: 'paid',
        paymentIntentId: paymentIntent.id,
      });
    }

    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (invoice && invoice.status !== 'paid') {
        invoice.status = 'paid';
        invoice.paidAmount = invoice.total;
        invoice.paidAt = new Date();
        invoice.paymentMethod = 'card';
        await invoice.save();

        if (invoice.appointmentId) {
          await Appointment.findByIdAndUpdate(invoice.appointmentId, {
            paymentStatus: 'paid',
            paymentIntentId: paymentIntent.id,
          });
        }
      }
    }
  }

  res.json({ received: true });
};


module.exports = {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook
};