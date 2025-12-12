const express = require('express');
const router = express.Router();
const {
  createInvoice,
  createInvoiceFromQuote,
  sendInvoice,
  getGarageInvoices,
  getClientInvoices,
  getInvoice,
  updateInvoice,
  markInvoiceAsPaid,
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les garagistes
router.post('/', createInvoice);
router.post('/from-quote/:quoteId', createInvoiceFromQuote);
router.get('/garage/me', getGarageInvoices);
router.get('/:id', getInvoice);
router.put('/:id', updateInvoice);
router.put('/:id/mark-paid', markInvoiceAsPaid);
router.post('/:id/send', sendInvoice);

// Routes pour les clients
router.get('/client/me', getClientInvoices);

module.exports = router;

