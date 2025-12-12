const express = require('express');
const router = express.Router();
const {
  createQuote,
  sendQuote,
  getGarageQuotes,
  getClientQuotes,
  getQuote,
  updateQuote,
  acceptQuote,
  rejectQuote,
} = require('../controllers/quoteController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les garagistes
router.post('/', createQuote);
router.get('/garage/me', getGarageQuotes);
router.get('/:id', getQuote);
router.put('/:id', updateQuote);
router.post('/:id/send', sendQuote);

// Routes pour les clients
router.get('/client/me', getClientQuotes);
router.put('/:id/accept', acceptQuote);
router.put('/:id/reject', rejectQuote);

module.exports = router;

