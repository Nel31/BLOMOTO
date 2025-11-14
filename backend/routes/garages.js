const express = require('express');
const router = express.Router();
const {
  getNearbyGarages,
  getGarages,
  getGarageById,
  createGarage,
  updateGarage,
  deleteGarage,
  getGarageByOwner,
  getGarageStats,
  getMyGarage,
  updateMyGarage,
} = require('../controllers/garageController');
const { protect, authorize } = require('../middleware/auth');

// Routes publiques
router.get('/nearby', getNearbyGarages);
router.get('/', getGarages);

// Routes protégées spécifiques garagiste (avant /:id pour éviter les conflits)
router.get('/me/stats', protect, authorize('garagiste'), getGarageStats);
router.get('/me', protect, authorize('garagiste'), getMyGarage);
router.put('/me', protect, authorize('garagiste'), updateMyGarage);
router.get('/owner/me', protect, authorize('garagiste'), getGarageByOwner);

// Routes publiques
router.get('/:id', getGarageById);

// Routes protégées
router.post('/', protect, authorize('admin'), createGarage); // Seul l'admin peut créer un garage
router.put('/:id', protect, authorize('garagiste', 'admin'), updateGarage);
router.delete('/:id', protect, authorize('admin'), deleteGarage);

module.exports = router;

