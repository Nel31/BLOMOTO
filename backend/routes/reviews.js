const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviews,
  getReviewById,
  getReviewsByGarage,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Routes publiques
router.get('/', getReviews);
router.get('/garage/:garageId', getReviewsByGarage);
router.get('/:id', getReviewById);

// Routes protégées
router.post('/', protect, authorize('client'), createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;

