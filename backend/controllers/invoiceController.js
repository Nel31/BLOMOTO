const Invoice = require('../models/Invoice');
const Quote = require('../models/Quote');
const Garage = require('../models/Garage');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { sendEmail } = require('../utils/emailService');
const Message = require('../models/Message');

// Helper pour générer un numéro de facture unique
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments({ invoiceNumber: new RegExp(`^FAC-${year}`) });
  return `FAC-${year}-${String(count + 1).padStart(4, '0')}`;
};

// Helper pour envoyer via Socket.io
const broadcastMessage = (req, message) => {
  const io = req.app.get('io');
  if (io) {
    const roomId = `conversation-${message.senderId}-${message.receiverId}`;
    io.to(roomId).emit('new-message', message);
  }
};

// @desc    Créer une facture
// @route   POST /api/invoices
// @access  Private (garagiste)
exports.createInvoice = async (req, res) => {
  try {
    const user = req.user;

    // Vérifier que l'utilisateur est un garagiste
    if (user.role !== 'garagiste' || !user.garageId) {
      return res.status(403).json({ message: 'Seuls les garagistes peuvent créer des factures' });
    }

    const { clientId, appointmentId, quoteId, items, taxRate, notes, dueDate } = req.body;

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

    // Vérifier le devis si fourni
    let quote = null;
    if (quoteId) {
      quote = await Quote.findById(quoteId)
        .populate('garageId')
        .populate('clientId')
        .populate('appointmentId');
      if (!quote || quote.garageId._id.toString() !== user.garageId.toString()) {
        return res.status(404).json({ message: 'Devis non trouvé ou non autorisé' });
      }
      // Vérifier que le devis est accepté
      if (quote.status !== 'accepted') {
        return res.status(400).json({ 
          message: 'Impossible de créer une facture. Le devis doit être accepté par le client.' 
        });
      }
      // Vérifier si une facture existe déjà pour ce devis
      const existingInvoice = await Invoice.findOne({ quoteId: quote._id });
      if (existingInvoice) {
        return res.status(400).json({ 
          message: 'Une facture existe déjà pour ce devis accepté.' 
        });
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
    const invoiceItems = items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    // Générer le numéro de facture
    const invoiceNumber = await generateInvoiceNumber();

    // Créer la facture directement en statut "sent"
    const invoice = await Invoice.create({
      invoiceNumber,
      garageId: user.garageId,
      clientId,
      appointmentId: appointmentId || null,
      quoteId: quoteId || null,
      items: invoiceItems,
      subtotal,
      tax,
      taxRate: taxRate || 0,
      total,
      notes: notes || '',
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
      status: 'sent',
    });

    // Générer le PDF automatiquement
    const populatedInvoiceForPDF = await Invoice.findById(invoice._id)
      .populate('garageId')
      .populate('clientId');
    
    try {
      const pdfUrlRelative = await generateInvoicePDF(invoice, populatedInvoiceForPDF.garageId, populatedInvoiceForPDF.clientId);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      invoice.pdfUrl = `${baseUrl}${pdfUrlRelative}`;
      await invoice.save();
    } catch (pdfError) {
      console.error('Erreur génération PDF:', pdfError);
      // On continue même si le PDF n'a pas pu être généré
    }

    // La facture n'est PAS envoyée automatiquement - le garagiste l'enverra manuellement via le chat

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('garageId', 'name address phone email')
      .populate('clientId', 'name email phone')
      .populate('appointmentId', 'date time')
      .populate('quoteId', 'quoteNumber');

    res.status(201).json({
      success: true,
      invoice: populatedInvoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Créer une facture à partir d'un devis
// @route   POST /api/invoices/from-quote/:quoteId
// @access  Private (garagiste)
exports.createInvoiceFromQuote = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'garagiste' || !user.garageId) {
      return res.status(403).json({ message: 'Seuls les garagistes peuvent créer des factures' });
    }

    const { quoteId } = req.params;
    const { dueDate } = req.body;

    const quote = await Quote.findById(quoteId)
      .populate('garageId')
      .populate('clientId')
      .populate('appointmentId');

    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    if (quote.garageId._id.toString() !== user.garageId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Vérifier que le devis est accepté
    if (quote.status !== 'accepted') {
      return res.status(400).json({ 
        message: 'Impossible de créer une facture. Le devis doit être accepté par le client.' 
      });
    }

    // Vérifier si une facture existe déjà pour ce devis
    const existingInvoice = await Invoice.findOne({ quoteId: quote._id });
    if (existingInvoice) {
      return res.status(400).json({ 
        message: 'Une facture existe déjà pour ce devis accepté.' 
      });
    }

    // Générer le numéro de facture
    const invoiceNumber = await generateInvoiceNumber();

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
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'sent',
    });

    // Générer le PDF automatiquement
    try {
      const pdfUrlRelative = await generateInvoicePDF(invoice, quote.garageId, quote.clientId);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      invoice.pdfUrl = `${baseUrl}${pdfUrlRelative}`;
      await invoice.save();
    } catch (pdfError) {
      console.error('Erreur génération PDF:', pdfError);
      // On continue même si le PDF n'a pas pu être généré
    }

    // La facture n'est PAS envoyée automatiquement - le garagiste l'enverra manuellement via le chat

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('garageId', 'name address phone email')
      .populate('clientId', 'name email phone')
      .populate('appointmentId', 'date time')
      .populate('quoteId', 'quoteNumber');

    res.status(201).json({
      success: true,
      invoice: populatedInvoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Générer et envoyer une facture (PDF)
// @route   POST /api/invoices/:id/send
// @access  Private (garagiste)
exports.sendInvoice = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { sendViaChat, sendViaEmail } = req.body;

    if (user.role !== 'garagiste' || !user.garageId) {
      return res.status(403).json({ message: 'Seuls les garagistes peuvent envoyer des factures' });
    }

    const invoice = await Invoice.findById(id)
      .populate('garageId')
      .populate('clientId')
      .populate('appointmentId')
      .populate('quoteId', 'quoteNumber');

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    if (invoice.garageId._id.toString() !== user.garageId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Générer le PDF si pas encore généré
    if (!invoice.pdfUrl) {
      const pdfUrlRelative = await generateInvoicePDF(invoice, invoice.garageId, invoice.clientId);
      // Construire l'URL complète
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      invoice.pdfUrl = `${baseUrl}${pdfUrlRelative}`;
    }

    // Mettre à jour le statut
    invoice.status = 'sent';
    const updateData = { status: 'sent' };

    // Envoyer via chat
    if (sendViaChat) {
      const message = await Message.create({
        senderId: user._id,
        receiverId: invoice.clientId._id,
        appointmentId: invoice.appointmentId?._id || null,
        content: `Facture ${invoice.invoiceNumber} - Montant total: ${invoice.total.toLocaleString('fr-FR')} XOF`,
        attachments: [invoice.pdfUrl],
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('senderId', 'name email avatar role')
        .populate('receiverId', 'name email avatar role');

      broadcastMessage(req, populatedMessage.toObject());
      updateData.sentViaChat = true;
    }

    // Envoyer via email
    if (sendViaEmail && invoice.clientId.email) {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Nouvelle facture</h2>
          <p>Bonjour ${invoice.clientId.name},</p>
          <p>Vous avez reçu une nouvelle facture de la part de ${invoice.garageId.name}.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>N° Facture:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Montant total:</strong> ${invoice.total.toLocaleString('fr-FR')} XOF</p>
            <p><strong>Date d'échéance:</strong> ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
            ${invoice.quoteId ? `<p><strong>Référence devis:</strong> ${invoice.quoteId.quoteNumber}</p>` : ''}
          </div>
          <p>Vous pouvez consulter la facture complète en pièce jointe.</p>
          <p>Cordialement,<br>L'équipe Promoto</p>
        </div>
      `;

      await sendEmail(
        invoice.clientId.email,
        `Facture ${invoice.invoiceNumber} - ${invoice.garageId.name}`,
        html
      );

      updateData.sentViaEmail = true;
    }

    // Mettre à jour la facture
    Object.assign(invoice, updateData);
    await invoice.save();

    res.json({
      success: true,
      message: 'Facture envoyée avec succès',
      invoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtenir toutes les factures du garage
// @route   GET /api/invoices/garage/me
// @access  Private (garagiste)
exports.getGarageInvoices = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'garagiste' || !user.garageId) {
      return res.status(403).json({ message: 'Seuls les garagistes peuvent accéder à cette ressource' });
    }

    const invoices = await Invoice.find({ garageId: user.garageId })
      .populate('clientId', 'name email phone')
      .populate('appointmentId', 'date time')
      .populate('quoteId', 'quoteNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir une facture spécifique
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate('garageId', 'name address phone email')
      .populate('clientId', 'name email phone')
      .populate('appointmentId', 'date time serviceId')
      .populate('quoteId', 'quoteNumber');

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    // Vérifier les permissions
    const isGaragiste = user.role === 'garagiste' && invoice.garageId._id.toString() === user.garageId?.toString();
    const isClient = invoice.clientId._id.toString() === user._id.toString();

    if (!isGaragiste && !isClient && user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour une facture
// @route   PUT /api/invoices/:id
// @access  Private (garagiste)
exports.updateInvoice = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (user.role !== 'garagiste' || !user.garageId) {
      return res.status(403).json({ message: 'Seuls les garagistes peuvent modifier des factures' });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    if (invoice.garageId.toString() !== user.garageId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Si la facture est payée, on ne peut que mettre à jour le statut de paiement
    if (invoice.status === 'paid' && req.body.items) {
      return res.status(400).json({ message: 'Une facture payée ne peut pas être modifiée' });
    }

    const { items, taxRate, notes, dueDate, status, paidAmount, paymentMethod } = req.body;

    // Recalculer les totaux si les items changent
    if (items) {
      const subtotal = items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unitPrice;
        return sum + itemTotal;
      }, 0);

      const tax = subtotal * (taxRate || invoice.taxRate) / 100;
      const total = subtotal + tax;

      const invoiceItems = items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      }));

      invoice.items = invoiceItems;
      invoice.subtotal = subtotal;
      invoice.tax = tax;
      invoice.total = total;
      invoice.taxRate = taxRate || invoice.taxRate;
      
      // Supprimer l'ancien PDF si on modifie les items
      invoice.pdfUrl = null;
    }

    if (notes !== undefined) invoice.notes = notes;
    if (dueDate) invoice.dueDate = new Date(dueDate);
    if (status) invoice.status = status;
    if (paidAmount !== undefined) {
      invoice.paidAmount = paidAmount;
      if (paidAmount >= invoice.total) {
        invoice.status = 'paid';
        invoice.paidAt = new Date();
      }
    }
    if (paymentMethod) invoice.paymentMethod = paymentMethod;

    await invoice.save();

    const updatedInvoice = await Invoice.findById(invoice._id)
      .populate('garageId', 'name address phone email')
      .populate('clientId', 'name email phone')
      .populate('appointmentId', 'date time')
      .populate('quoteId', 'quoteNumber');

    res.json({
      success: true,
      invoice: updatedInvoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Marquer une facture comme payée
// @route   PUT /api/invoices/:id/mark-paid
// @access  Private (garagiste)
exports.markInvoiceAsPaid = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { paidAmount, paymentMethod } = req.body;

    if (user.role !== 'garagiste' || !user.garageId) {
      return res.status(403).json({ message: 'Seuls les garagistes peuvent marquer des factures comme payées' });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    if (invoice.garageId.toString() !== user.garageId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    invoice.paidAmount = paidAmount || invoice.total;
    invoice.status = 'paid';
    invoice.paidAt = new Date();
    if (paymentMethod) invoice.paymentMethod = paymentMethod;

    await invoice.save();

    const updatedInvoice = await Invoice.findById(invoice._id)
      .populate('garageId', 'name address phone email')
      .populate('clientId', 'name email phone')
      .populate('appointmentId', 'date time')
      .populate('quoteId', 'quoteNumber');

    res.json({
      success: true,
      invoice: updatedInvoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtenir les factures du client
// @route   GET /api/invoices/client/me
// @access  Private (client)
exports.getClientInvoices = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'client') {
      return res.status(403).json({ message: 'Seuls les clients peuvent accéder à cette ressource' });
    }

    const invoices = await Invoice.find({ clientId: user._id })
      .populate('garageId', 'name address phone email')
      .populate('appointmentId', 'date time')
      .populate('quoteId', 'quoteNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir toutes les factures (admin)
// @route   GET /api/admin/invoices
// @access  Private (admin)
exports.getAllInvoices = async (req, res) => {
  try {
    const { garageId, status, dateFrom, dateTo } = req.query;
    
    const filter = {};
    if (garageId) filter.garageId = garageId;
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    const invoices = await Invoice.find(filter)
      .populate('garageId', 'name address phone email')
      .populate('clientId', 'name email phone')
      .populate('appointmentId', 'date time')
      .populate('quoteId', 'quoteNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

