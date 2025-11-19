const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  getServicesByGarage,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

// Routes publiques
router.get('/', getServices);
router.get('/garage/:garageId', getServicesByGarage);
router.get('/:id', getServiceById);

// Routes protégées
router.post('/', protect, authorize('garagiste', 'admin'), createService);
router.put('/:id', protect, authorize('garagiste', 'admin'), updateService);
router.delete('/:id', protect, authorize('garagiste', 'admin'), deleteService);

module.exports = router;

