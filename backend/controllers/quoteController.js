const Quote = require('../models/Quote');
const Invoice = require('../models/Invoice');
const Garage = require('../models/Garage');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { generateQuotePDF } = require('../utils/pdfGenerator');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { sendEmail } = require('../utils/emailService');
const Message = require('../models/Message');

// Helper pour générer un numéro de devis unique
const generateQuoteNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Quote.countDocuments({ quoteNumber: new RegExp(`^DEV-${year}`) });
  return `DEV-${year}-${String(count + 1).padStart(4, '0')}`;
};

// Helper pour envoyer via Socket.io
const broadcastMessage = (req, message) => {
  const io = req.app.get('io');
  if (io) {
    const roomId = `conversation-${message.senderId}-${message.receiverId}`;
    io.to(roomId).emit('new-message', message);
  }
};

// @desc    Créer un devis
// @route   POST /api/quotes
// @access  Private (garagiste)
exports.createQuote = async (req, res) => {
  try {
    const user = req.user;

    // Vérifier que l'utilisateur est un garagiste
    if (user.role !== 'garagiste' || !user.garageId) {
      return res.status(403).json({ message: 'Seuls les garagistes peuvent créer des devis' });
    }

    const { clientId, appointmentId, items, taxRate, notes, validUntil } = req.body;

    // Vérifier que le client existe
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    // Vérifier le garage
    const garage = await Garage.findById(user.garageId);
    if (!garage) {
      return res.status(404).json({ message: 'Garage non trouvé' });
    }

    // Vérifier l'appointment si fourni
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || appointment.garageId.toString() !== user.garageId.toString()) {
        return res.status(404).json({ message: 'Rendez-vous non trouvé ou non autorisé' });
      }
    }

    // Calculer les totaux
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + itemTotal;
    }, 0);

    const tax = subtotal * (taxRate || 0) / 100;
    const total = subtotal + tax;

    // Préparer les items avec les totaux
    const quoteItems = items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    // Générer le numéro de devis
    const quoteNumber = await generateQuoteNumber();

    // Créer le devis directement en statut "sent"
    const quote = await Quote.create({
      quoteNumber,
      garageId: user.garageId,
      clientId,
      appointmentId: appointmentId || null,
      items: quoteItems,
      subtotal,
      tax,
      taxRate: taxRate || 0,
      total,
      notes: notes || '',
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
      status: 'sent',
    });

    // Générer le PDF automatiquement
    const populatedQuoteForPDF = await Quote.findById(quote._id)
      .populate('garageId')
      .populate('clientId');
    
    try {
      const pdfUrlRelative = await generateQuotePDF(quote, populatedQuoteForPDF.garageId, populatedQuoteForPDF.clientId);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      quote.pdfUrl = `${baseUrl}${pdfUrlRelative}`;
      await quote.save();
    } catch (pdfError) {
      console.error('Erreur génération PDF:', pdfError);
      // On continue même si le PDF n'a pas pu être généré
    }

    // Le devis n'est PAS envoyé automatiquement - le garagiste l'enverra manuellement via le chat

    const populatedQuote = await Quote.findById(quote._id)
      .populate('garageId', 'name address phone email')
      .populate('clientId', 'name email phone')
      .populate('appointmentId', 'date time');

    res.status(201).json({
      success: true,
      quote: populatedQuote,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Générer et envoyer un devis (PDF)
// @route   POST /api/quotes/:id/send
// @access  Private (garagiste)
exports.sendQuote = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { sendViaChat, sendViaEmail } = req.body;

    // Vérifier que l'utilisateur est un garagiste
    if (user.role !== 'garagiste' || !user.garageId) {
      return res.status(403).json({ message: 'Seuls les garagistes peuvent envoyer des devis' });
    }

    const quote = await Quote.findById(id)
      .populate('garageId')
      .populate('clientId')
      .populate('appointmentId');

    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    // Vérifier que le devis appartient au garage du garagiste
    if (quote.garageId._id.toString() !== user.garageId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Générer le PDF si pas encore généré
    if (!quote.pdfUrl) {
      const pdfUrlRelative = await generateQuotePDF(quote, quote.garageId, quote.clientId);
      // Construire l'URL complète
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      quote.pdfUrl = `${baseUrl}${pdfUrlRelative}`;
    }

    // Mettre à jour le statut
    quote.status = 'sent';
    const updateData = { status: 'sent' };

    // Envoyer via chat
    if (sendViaChat) {
      const message = await Message.create({
        senderId: user._id,
        receiverId: quote.clientId._id,
        appointmentId: quote.appointmentId?._id || null,
        content: `Devis ${quote.quoteNumber} - Montant total: ${quote.total.toLocaleString('fr-FR')} XOF`,
        attachments: [quote.pdfUrl],
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('senderId', 'name email avatar role')
        .populate('receiverId', 'name email avatar role');

      broadcastMessage(req, populatedMessage.toObject());
      updateData.sentViaChat = true;
    }

    // Envoyer via email
    if (sendViaEmail && quote.clientId.email) {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Nouveau devis</h2>
          <p>Bonjour ${quote.clientId.name},</p>
          <p>Vous avez reçu un nouveau devis de la part de ${quote.garageId.name}.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>N° Devis:</strong> ${quote.quoteNumber}</p>
            <p><strong>Montant total:</strong> ${quote.total.toLocaleString('fr-FR')} XOF</p>
            <p><strong>Valide jusqu'au:</strong> ${new Date(quote.validUntil).toLocaleDateString('fr-FR')}</p>
          </div>
          <p>Vous pouvez consulter le devis complet en pièce jointe.</p>
          <p>Cordialement,<br>L'équipe Promoto</p>
        </div>
      `;

      await sendEmail(
        quote.clientId.email,
        `Devis ${quote.quoteNumber} - ${quote.garageId.name}`,
        html
      );

      updateData.sentViaEmail = true;
    }

    // Mettre à jour le devis
    Object.assign(quote, updateData);
    await quote.save();

    res.json({
      success: true,
      message: 'Devis envoyé avec succès',
      quote,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtenir tous les devis du garage
// @route   GET /api/quotes/garage/me
// @access  Private (garagiste)
exports.getGarageQuotes = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'garagiste' || !user.garageId) {
      return res.status(403).json({ message: 'Seuls les garagistes peuvent accéder à cette ressource' });
    }

    const quotes = await Quote.find({ garageId: user.garageId })
      .populate('clientId', 'name email phone')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quotes.length,
      quotes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir un devis spécifique
// @route   GET /api/quotes/:id
// @access  Private
exports.getQuote = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const quote = await Quote.findById(id)
      .populate('garageId', 'name address phone email')
      .populate('clientId', 'name email phone')
      .populate('appointmentId', 'date time serviceId');

    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    // Vérifier les permissions
    const isGaragiste = user.role === 'garagiste' && quote.garageId._id.toString() === user.garageId?.toString();
    const isClient = quote.clientId._id.toString() === user._id.toString();

    if (!isGaragiste && !isClient && user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    res.json({
      success: true,
      quote,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour un devis
// @route   PUT /api/quotes/:id
// @access  Private (garagiste)
exports.updateQuote = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (user.role !== 'garagiste' || !user.garageId) {
      return res.status(403).json({ message: 'Seuls les garagistes peuvent modifier des devis' });
    }

    const quote = await Quote.findById(id);
    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    if (quote.garageId.toString() !== user.garageId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Si le devis est déjà envoyé, on ne peut que changer le statut
    if (quote.status === 'sent' && req.body.items) {
      return res.status(400).json({ message: 'Un devis envoyé ne peut pas être modifié' });
    }

    const { items, taxRate, notes, validUntil, status } = req.body;

    // Recalculer les totaux si les items changent
    if (items) {
      const subtotal = items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unitPrice;
        return sum + itemTotal;
      }, 0);

      const tax = subtotal * (taxRate || quote.taxRate) / 100;
      const total = subtotal + tax;

      const quoteItems = items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      }));

      quote.items = quoteItems;
      quote.subtotal = subtotal;
      quote.tax = tax;
      quote.total = total;
      quote.taxRate = taxRate || quote.taxRate;
      
      // Supprimer l'ancien PDF si on modifie les items
      quote.pdfUrl = null;
    }

    if (notes !== undefined) quote.notes = notes;
    if (validUntil) quote.validUntil = new Date(validUntil);
    if (status) quote.status = status;

    await quote.save();

    const updatedQuote = await Quote.findById(quote._id)
      .populate('garageId', 'name address phone email')
      .populate('clientId', 'name email phone')
      .populate('appointmentId', 'date time');

    res.json({
      success: true,
      quote: updatedQuote,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtenir les devis du client
// @route   GET /api/quotes/client/me
// @access  Private (client)
exports.getClientQuotes = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'client') {
      return res.status(403).json({ message: 'Seuls les clients peuvent accéder à cette ressource' });
    }

    const quotes = await Quote.find({ clientId: user._id })
      .populate('garageId', 'name address phone email')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quotes.length,
      quotes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accepter un devis (client)
// @route   PUT /api/quotes/:id/accept
// @access  Private (client)
exports.acceptQuote = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'client') {
      return res.status(403).json({ message: 'Seuls les clients peuvent accepter des devis' });
    }

    const { id } = req.params;
    const quote = await Quote.findById(id)
      .populate('garageId')
      .populate('clientId')
      .populate('appointmentId');

    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    // Vérifier que le devis appartient au client
    if (quote.clientId._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Vérifier que le devis est en statut "sent"
    if (quote.status !== 'sent') {
      return res.status(400).json({ 
        message: `Ce devis ne peut pas être accepté. Statut actuel: ${quote.status}` 
      });
    }

    // Vérifier que le devis n'est pas expiré
    if (new Date(quote.validUntil) < new Date()) {
      quote.status = 'expired';
      await quote.save();
      return res.status(400).json({ message: 'Ce devis a expiré' });
    }

    // Mettre à jour le statut du devis
    quote.status = 'accepted';
    await quote.save();

    // Créer automatiquement la facture à partir du devis accepté
    try {
      // Générer le numéro de facture
      const year = new Date().getFullYear();
      const count = await Invoice.countDocuments({ invoiceNumber: new RegExp(`^FAC-${year}`) });
      const invoiceNumber = `FAC-${year}-${String(count + 1).padStart(4, '0')}`;

      // Créer la facture à partir du devis
      const invoice = await Invoice.create({
        invoiceNumber,
        garageId: quote.garageId._id,
        clientId: quote.clientId._id,
        appointmentId: quote.appointmentId?._id || null,
        quoteId: quote._id,
        items: quote.items,
        subtotal: quote.subtotal,
        tax: quote.tax,
        taxRate: quote.taxRate,
        total: quote.total,
        notes: quote.notes,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
        status: 'draft', // Statut draft car elle sera envoyée manuellement
      });

      // Générer le PDF de la facture
      try {
        const pdfUrlRelative = await generateInvoicePDF(invoice, quote.garageId, quote.clientId);
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        invoice.pdfUrl = `${baseUrl}${pdfUrlRelative}`;
        invoice.status = 'sent'; // Passer en "sent" une fois le PDF généré
        await invoice.save();
      } catch (pdfError) {
        console.error('Erreur génération PDF facture:', pdfError);
        // On continue même si le PDF n'a pas pu être généré
      }
    } catch (invoiceError) {
      console.error('Erreur création facture automatique:', invoiceError);
      // On continue même si la création de la facture échoue
    }

    const updatedQuote = await Quote.findById(quote._id)
      .populate('garageId', 'name address phone email')
      .populate('clientId', 'name email phone')
      .populate('appointmentId', 'date time');

    res.json({
      success: true,
      message: 'Devis accepté avec succès',
      quote: updatedQuote,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Rejeter un devis (client)
// @route   PUT /api/quotes/:id/reject
// @access  Private (client)
exports.rejectQuote = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'client') {
      return res.status(403).json({ message: 'Seuls les clients peuvent rejeter des devis' });
    }

    const { id } = req.params;
    const quote = await Quote.findById(id)
      .populate('garageId')
      .populate('clientId')
      .populate('appointmentId');

    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    // Vérifier que le devis appartient au client
    if (quote.clientId._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Vérifier que le devis est en statut "sent"
    if (quote.status !== 'sent') {
      return res.status(400).json({ 
        message: `Ce devis ne peut pas être rejeté. Statut actuel: ${quote.status}` 
      });
    }

    // Mettre à jour le statut du devis
    quote.status = 'rejected';
    await quote.save();

    const updatedQuote = await Quote.findById(quote._id)
      .populate('garageId', 'name address phone email')
      .populate('clientId', 'name email phone')
      .populate('appointmentId', 'date time');

    res.json({
      success: true,
      message: 'Devis rejeté',
      quote: updatedQuote,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

