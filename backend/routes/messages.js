const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getConversation,
  markAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(protect);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversation/:userId', getConversation);
router.put('/read', markAsRead);

module.exports = router;

