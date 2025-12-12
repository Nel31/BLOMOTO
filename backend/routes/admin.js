const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  createGaragisteAccount,
  getAllGaragistes,
  deleteGaragiste,
  suspendGarage,
  activateGarage,
  verifyGarage,
  unverifyGarage,
  getAllAppointments,
  getAllReviews,
  deleteReview,
  getAllServices,
  getAnalytics,
} = require('../controllers/adminController');
const { getAllInvoices } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

// Toutes les routes admin nécessitent une authentification et le rôle admin
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.post('/garagistes', createGaragisteAccount);
router.get('/garagistes', getAllGaragistes);
router.delete('/garagistes/:id', deleteGaragiste);
router.put('/garages/:id/suspend', suspendGarage);
router.put('/garages/:id/activate', activateGarage);
router.put('/garages/:id/verify', verifyGarage);
router.put('/garages/:id/unverify', unverifyGarage);
router.get('/appointments', getAllAppointments);
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);
router.get('/services', getAllServices);
router.get('/invoices', getAllInvoices);

module.exports = router;

