const { FedaPay, Transaction, Customer } = require('fedapay');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');

const FEDAPAY_API_KEY = process.env.FEDAPAY_API_KEY;
const FEDAPAY_ENVIRONMENT = process.env.FEDAPAY_ENVIRONMENT || 'sandbox'; // 'sandbox' ou 'live'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Configurer FedaPay
if (FEDAPAY_API_KEY) {
  FedaPay.setApiKey(FEDAPAY_API_KEY);
  FedaPay.setEnvironment(FEDAPAY_ENVIRONMENT);
}

// @desc    Créer un paiement FedaPay
// @route   POST /api/payments/fedapay/create
// @access  Private/Client
exports.createFedapayPayment = async (req, res) => {
  try {
    if (!FEDAPAY_API_KEY) {
      return res.status(500).json({ 
        message: 'FedaPay non configuré. Configurez FEDAPAY_API_KEY dans votre .env' 
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
    const backendBaseUrl = `${req.protocol}://${req.get('host')}`;
    const callbackUrl = `${backendBaseUrl}/api/payments/fedapay/callback`;
    const returnUrl = `${FRONTEND_URL}/payment-success`;
    const cancelUrl = `${FRONTEND_URL}/payment-cancel`;

    try {
      // Créer ou récupérer le client FedaPay
      let customer = null;
      const customerEmailToUse = customerEmail || req.user.email;
      const customerNameToUse = customerName || req.user.name;
      const customerPhoneToUse = customerPhone || req.user.phone;

      // Extraire le prénom et nom si possible
      const nameParts = customerNameToUse ? customerNameToUse.split(' ') : [];
      const firstname = nameParts[0] || 'Client';
      const lastname = nameParts.slice(1).join(' ') || 'Promoto';

      // Créer le client FedaPay
      try {
        customer = await Customer.create({
          firstname: firstname,
          lastname: lastname,
          email: customerEmailToUse,
          phone_number: customerPhoneToUse ? {
            number: customerPhoneToUse.replace(/\D/g, ''), // Supprimer les caractères non numériques
            country: 'BJ' // Par défaut Bénin, peut être configuré
          } : undefined
        });
      } catch (customerError) {
        console.warn('Erreur création client FedaPay (continuer quand même):', customerError.message);
        // Continuer sans client si l'email existe déjà ou autre erreur
      }

      // Créer la transaction FedaPay
      const transactionData = {
        description: referenceType === 'appointment' 
          ? `Paiement rendez-vous #${referenceId}` 
          : `Paiement facture #${referenceId}`,
        amount: Math.round(amount),
        currency: { iso: currency },
        callback_url: callbackUrl,
        customer: customer ? { id: customer.id } : undefined,
        metadata: {
          userId: req.user._id.toString(),
          referenceId: referenceId.toString(),
          referenceType: referenceType,
        }
      };

      // Ajouter les URLs de retour si supportées
      if (returnUrl) {
        transactionData.return_url = returnUrl;
      }
      if (cancelUrl) {
        transactionData.cancel_url = cancelUrl;
      }

      const transaction = await Transaction.create(transactionData);

      // Récupérer l'URL de paiement
      const paymentUrl = transaction.to_payload?.redirect_url || 
                        transaction.redirect_url || 
                        transaction.url ||
                        `https://pay.fedapay.com/${transaction.id}`;

      res.json({
        success: true,
        transactionId: transaction.id?.toString() || transaction.id,
        paymentUrl: paymentUrl,
        ...transaction
      });
    } catch (apiError) {
      console.error('Erreur API FedaPay:', apiError.response?.data || apiError.message || apiError);
      return res.status(500).json({ 
        message: 'Erreur lors de la création du paiement FedaPay',
        error: apiError.response?.data || apiError.message || apiError.toString()
      });
    }
  } catch (error) {
    console.error('Erreur createFedapayPayment:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vérifier le statut d'un paiement FedaPay
// @route   GET /api/payments/fedapay/status/:transactionId
// @access  Private
exports.checkFedapayStatus = async (req, res) => {
  try {
    if (!FEDAPAY_API_KEY) {
      return res.status(500).json({ message: 'FedaPay non configuré' });
    }

    const { transactionId } = req.params;

    try {
      const transaction = await Transaction.retrieve(transactionId);

      // Mettre à jour le statut si le paiement est réussi
      const status = transaction.status || transaction.state;
      const isSuccess = status === 'approved' || 
                       status === 'APPROVED' || 
                       status === 'completed' ||
                       status === 'COMPLETED' ||
                       status === 'paid' ||
                       status === 'PAID';

      if (isSuccess) {
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
            paidAmount: transaction.amount || transaction.total_amount,
            paidAt: new Date(),
            paymentMethod: 'fedapay',
          });
        }
      }

      res.json({
        success: true,
        status: status,
        transaction: transaction
      });
    } catch (apiError) {
      console.error('Erreur vérification statut FedaPay:', apiError.response?.data || apiError.message || apiError);
      return res.status(500).json({ 
        message: 'Erreur lors de la vérification du statut',
        error: apiError.response?.data || apiError.message || apiError.toString()
      });
    }
  } catch (error) {
    console.error('Erreur checkFedapayStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Vérifier le statut d'une transaction directement auprès de l'API FedaPay
 * 
 * ⚠️ IMPORTANT : Cette fonction effectue une vérification serveur à serveur
 * pour s'assurer que le paiement est réellement réussi et éviter la fraude.
 * 
 * @param {string} transactionId - ID de la transaction à vérifier
 * @returns {Promise<Object|null>} Données de la transaction ou null si erreur
 */
async function verifyPaymentWithFedapay(transactionId) {
  try {
    if (!FEDAPAY_API_KEY) {
      console.error('FEDAPAY_API_KEY non configuré');
      return null;
    }

    const transaction = await Transaction.retrieve(transactionId);
    return transaction;
  } catch (error) {
    console.error('Erreur vérification transaction FedaPay:', error.response?.data || error.message || error);
    return null;
  }
}

// @desc    Callback webhook FedaPay
// @route   POST /api/payments/fedapay/callback
// @access  Public
exports.fedapayCallback = async (req, res) => {
  // Logger le callback pour audit
  console.log('📥 Callback FedaPay reçu:', {
    timestamp: new Date().toISOString(),
    body: req.body,
    ip: req.ip || req.connection.remoteAddress,
  });

  try {
    const { transaction_id, id, status, state, amount, metadata } = req.body;
    const transactionId = transaction_id || id;

    if (!transactionId) {
      console.warn('⚠️ Callback FedaPay: transaction_id manquant');
      return res.status(400).json({ message: 'transaction_id manquant' });
    }

    // ⚠️ SÉCURITÉ : Vérifier le paiement via l'API FedaPay (serveur à serveur)
    // Ne jamais faire confiance aux données reçues sans vérification
    const verifiedTransaction = await verifyPaymentWithFedapay(transactionId);

    if (!verifiedTransaction) {
      console.error('❌ Échec de la vérification de la transaction:', transactionId);
      // Répondre quand même 200 à FedaPay pour éviter les retries inutiles
      return res.status(200).json({ 
        received: true, 
        status: 'verification_failed',
        message: 'Impossible de vérifier la transaction'
      });
    }

    // Vérifier que le statut est bien réussi
    const verifiedStatus = verifiedTransaction.status || verifiedTransaction.state;
    const isSuccess = verifiedStatus === 'approved' || 
                     verifiedStatus === 'APPROVED' || 
                     verifiedStatus === 'completed' ||
                     verifiedStatus === 'COMPLETED' ||
                     verifiedStatus === 'paid' ||
                     verifiedStatus === 'PAID';

    if (!isSuccess) {
      console.log('ℹ️ Transaction non réussie:', {
        transactionId,
        status: verifiedStatus,
      });
      // Répondre 200 à FedaPay mais ne rien faire
      return res.status(200).json({ 
        received: true, 
        status: 'not_success',
        message: 'Transaction non réussie'
      });
    }

    // Vérifier que le montant correspond (sécurité supplémentaire)
    const verifiedAmount = verifiedTransaction.amount || verifiedTransaction.total_amount;
    if (amount && verifiedAmount && Math.abs(amount - verifiedAmount) > 1) {
      console.warn('⚠️ Montant incohérent:', {
        transactionId,
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
        transactionId,
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
            paymentIntentId: transactionId,
            paidAt: new Date(),
            paymentMethod: 'fedapay',
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
            paymentMethod: 'fedapay',
          });
          console.log('✅ Facture mise à jour:', referenceId);
        }
      } else {
        console.warn('⚠️ Type de référence inconnu:', referenceType);
      }
    } catch (dbError) {
      console.error('❌ Erreur mise à jour base de données:', dbError);
      // Répondre quand même 200 à FedaPay
    }

    // Répondre rapidement à FedaPay (important pour éviter les retries)
    res.status(200).json({ 
      received: true, 
      status: 'ok',
      message: 'Paiement traité avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur fedapayCallback:', error);
    // Répondre 200 même en cas d'erreur pour éviter les retries
    // Mais logger l'erreur pour investigation
    res.status(200).json({ 
      received: true, 
      status: 'error',
      message: error.message 
    });
  }
};
