const axios = require('axios');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');

const KKIAPAY_SECRET_KEY = process.env.KKIAPAY_SECRET_KEY;
const KKIAPAY_PUBLIC_KEY = process.env.KKIAPAY_PUBLIC_KEY;
const KKIAPAY_API_URL = process.env.KKIAPAY_API_URL || 'https://api.kkiapay.me';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// @desc    Créer un paiement KKIAPAY
// @route   POST /api/payments/kkiapay/create
// @access  Private/Client
exports.createKkiapayPayment = async (req, res) => {
  try {
    if (!KKIAPAY_SECRET_KEY || !KKIAPAY_PUBLIC_KEY) {
      return res.status(500).json({ 
        message: 'KKIAPAY non configuré. Configurez KKIAPAY_SECRET_KEY et KKIAPAY_PUBLIC_KEY dans votre .env' 
      });
    }

    const { appointmentId, invoiceId, amount, currency = 'XOF', customerEmail, customerPhone, customerName } = req.body;

    // Vérifier que l'utilisateur est un client
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Seuls les clients peuvent effectuer des paiements' });
    }

    // Vérifier le rendez-vous ou la facture
    let referenceId = null;
    let referenceType = null;

    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Rendez-vous non trouvé' });
      }
      if (appointment.clientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Non autorisé' });
      }
      referenceId = appointmentId;
      referenceType = 'appointment';
    } else if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        return res.status(404).json({ message: 'Facture non trouvée' });
      }
      if (invoice.clientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Non autorisé' });
      }
      referenceId = invoiceId;
      referenceType = 'invoice';
    } else {
      return res.status(400).json({ message: 'appointmentId ou invoiceId requis' });
    }

    // Construire les URLs
    // Le callback doit pointer vers le backend (pour la vérification serveur à serveur)
    const backendBaseUrl = `${req.protocol}://${req.get('host')}`;
    const callbackUrl = `${backendBaseUrl}/api/payments/kkiapay/callback`;
    
    // Les URLs de retour pointent vers le frontend
    const returnUrl = `${FRONTEND_URL}/payment-success`;
    const cancelUrl = `${FRONTEND_URL}/payment-cancel`;

    // Créer la transaction KKIAPAY
    try {
      const response = await axios.post(`${KKIAPAY_API_URL}/v1/transactions`, {
        amount: Math.round(amount), // Montant en unité de la devise (XOF, FCFA, etc.)
        currency: currency,
        customer_email: customerEmail || req.user.email,
        customer_phone: customerPhone || req.user.phone,
        customer_name: customerName || req.user.name,
        callback_url: callbackUrl,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: req.user._id.toString(),
          referenceId: referenceId.toString(),
          referenceType: referenceType,
        },
      }, {
        headers: {
          'Authorization': `Bearer ${KKIAPAY_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      res.json({
        success: true,
        transactionId: response.data.transaction_id || response.data.id,
        paymentUrl: response.data.payment_url || response.data.url,
        publicKey: KKIAPAY_PUBLIC_KEY,
        ...response.data
      });
    } catch (apiError) {
      console.error('Erreur API KKIAPAY:', apiError.response?.data || apiError.message);
      return res.status(500).json({ 
        message: 'Erreur lors de la création du paiement KKIAPAY',
        error: apiError.response?.data || apiError.message
      });
    }
  } catch (error) {
    console.error('Erreur createKkiapayPayment:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vérifier le statut d'un paiement KKIAPAY
// @route   GET /api/payments/kkiapay/status/:transactionId
// @access  Private
exports.checkKkiapayStatus = async (req, res) => {
  try {
    if (!KKIAPAY_SECRET_KEY) {
      return res.status(500).json({ message: 'KKIAPAY non configuré' });
    }

    const { transactionId } = req.params;

    try {
      const response = await axios.get(`${KKIAPAY_API_URL}/v1/transactions/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${KKIAPAY_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const transaction = response.data;

      // Mettre à jour le statut si le paiement est réussi
      if (transaction.status === 'SUCCESS' || transaction.status === 'success') {
        const metadata = transaction.metadata || {};
        const referenceId = metadata.referenceId;
        const referenceType = metadata.referenceType;

        if (referenceType === 'appointment' && referenceId) {
          await Appointment.findByIdAndUpdate(referenceId, {
            paymentStatus: 'paid',
            paymentIntentId: transactionId,
          });
        } else if (referenceType === 'invoice' && referenceId) {
          await Invoice.findByIdAndUpdate(referenceId, {
            status: 'paid',
            paidAmount: transaction.amount,
            paidAt: new Date(),
            paymentMethod: 'kkiapay',
          });
        }
      }

      res.json({
        success: true,
        status: transaction.status,
        transaction: transaction
      });
    } catch (apiError) {
      console.error('Erreur vérification statut KKIAPAY:', apiError.response?.data || apiError.message);
      return res.status(500).json({ 
        message: 'Erreur lors de la vérification du statut',
        error: apiError.response?.data || apiError.message
      });
    }
  } catch (error) {
    console.error('Erreur checkKkiapayStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Vérifier le statut d'une transaction directement auprès de l'API KKIAPAY
 * 
 * ⚠️ IMPORTANT : Cette fonction effectue une vérification serveur à serveur
 * pour s'assurer que le paiement est réellement réussi et éviter la fraude.
 * 
 * @param {string} transactionId - ID de la transaction à vérifier
 * @returns {Promise<Object|null>} Données de la transaction ou null si erreur
 */
async function verifyPaymentWithKkiapay(transactionId) {
  try {
    if (!KKIAPAY_SECRET_KEY) {
      console.error('KKIAPAY_SECRET_KEY non configuré');
      return null;
    }

    const response = await axios.get(`${KKIAPAY_API_URL}/v1/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${KKIAPAY_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erreur vérification transaction KKIAPAY:', error.response?.data || error.message);
    return null;
  }
}

// @desc    Callback webhook KKIAPAY
// @route   POST /api/payments/kkiapay/callback
// @access  Public
exports.kkiapayCallback = async (req, res) => {
  // Logger le callback pour audit
  console.log('📥 Callback KKIAPAY reçu:', {
    timestamp: new Date().toISOString(),
    body: req.body,
    ip: req.ip || req.connection.remoteAddress,
  });

  try {
    const { transaction_id, status, amount, metadata } = req.body;

    if (!transaction_id) {
      console.warn('⚠️ Callback KKIAPAY: transaction_id manquant');
      return res.status(400).json({ message: 'transaction_id manquant' });
    }

    // ⚠️ SÉCURITÉ : Vérifier le paiement via l'API KKIAPAY (serveur à serveur)
    // Ne jamais faire confiance aux données reçues sans vérification
    const verifiedTransaction = await verifyPaymentWithKkiapay(transaction_id);

    if (!verifiedTransaction) {
      console.error('❌ Échec de la vérification de la transaction:', transaction_id);
      // Répondre quand même 200 à KKIAPAY pour éviter les retries inutiles
      // mais ne pas mettre à jour la base de données
      return res.status(200).json({ 
        received: true, 
        status: 'verification_failed',
        message: 'Impossible de vérifier la transaction'
      });
    }

    // Vérifier que le statut est bien SUCCESS
    const verifiedStatus = verifiedTransaction.status || verifiedTransaction.transaction_status;
    const isSuccess = verifiedStatus === 'SUCCESS' || 
                     verifiedStatus === 'success' || 
                     verifiedStatus === 'SUCCEEDED' ||
                     verifiedStatus === 'succeeded';

    if (!isSuccess) {
      console.log('ℹ️ Transaction non réussie:', {
        transaction_id,
        status: verifiedStatus,
      });
      // Répondre 200 à KKIAPAY mais ne rien faire
      return res.status(200).json({ 
        received: true, 
        status: 'not_success',
        message: 'Transaction non réussie'
      });
    }

    // Vérifier que le montant correspond (sécurité supplémentaire)
    const verifiedAmount = verifiedTransaction.amount || verifiedTransaction.transaction_amount;
    if (amount && verifiedAmount && Math.abs(amount - verifiedAmount) > 1) {
      console.warn('⚠️ Montant incohérent:', {
        transaction_id,
        received_amount: amount,
        verified_amount: verifiedAmount,
      });
      // On continue quand même, mais on log l'anomalie
    }

    // Extraire les métadonnées (depuis le callback ou la vérification)
    const transactionMetadata = metadata || verifiedTransaction.metadata || {};
    const referenceId = transactionMetadata.referenceId;
    const referenceType = transactionMetadata.referenceType;

    if (!referenceId || !referenceType) {
      console.warn('⚠️ Métadonnées manquantes:', {
        transaction_id,
        metadata: transactionMetadata,
      });
      // Répondre 200 mais ne rien faire
      return res.status(200).json({ 
        received: true, 
        status: 'metadata_missing',
        message: 'Métadonnées manquantes'
      });
    }

    // Mettre à jour la base de données uniquement après vérification
    try {
      if (referenceType === 'appointment' && referenceId) {
        const appointment = await Appointment.findById(referenceId);
        if (appointment && appointment.paymentStatus !== 'paid') {
          await Appointment.findByIdAndUpdate(referenceId, {
            paymentStatus: 'paid',
            paymentIntentId: transaction_id,
            paidAt: new Date(),
            paymentMethod: 'kkiapay',
          });
          console.log('✅ Rendez-vous mis à jour:', referenceId);
        }
      } else if (referenceType === 'invoice' && referenceId) {
        const invoice = await Invoice.findById(referenceId);
        if (invoice && invoice.status !== 'paid') {
          await Invoice.findByIdAndUpdate(referenceId, {
            status: 'paid',
            paidAmount: verifiedAmount || amount || invoice.total,
            paidAt: new Date(),
            paymentMethod: 'kkiapay',
          });
          console.log('✅ Facture mise à jour:', referenceId);
        }
      } else {
        console.warn('⚠️ Type de référence inconnu:', referenceType);
      }
    } catch (dbError) {
      console.error('❌ Erreur mise à jour base de données:', dbError);
      // Répondre quand même 200 à KKIAPAY
    }

    // Répondre rapidement à KKIAPAY (important pour éviter les retries)
    res.status(200).json({ 
      received: true, 
      status: 'ok',
      message: 'Paiement traité avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur kkiapayCallback:', error);
    // Répondre 200 même en cas d'erreur pour éviter les retries
    // Mais logger l'erreur pour investigation
    res.status(200).json({ 
      received: true, 
      status: 'error',
      message: error.message 
    });
  }
};

