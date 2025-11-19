const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getClientAppointments,
  getGarageAppointments,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(protect);

router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/client/me', getClientAppointments);
router.get('/garage/me', getGarageAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;

