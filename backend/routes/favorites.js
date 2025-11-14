const express = require('express');
const router = express.Router();
const {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
} = require('../controllers/favoriteController');
const { protect, authorize } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(protect);
router.use(authorize('client'));

router.post('/', addFavorite);
router.get('/', getFavorites);
router.get('/check/:garageId', checkFavorite);
router.delete('/:garageId', removeFavorite);

module.exports = router;

