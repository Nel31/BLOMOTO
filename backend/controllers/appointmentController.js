const Appointment = require('../models/Appointment');
const emailService = require('../utils/emailService');
const smsService = require('../utils/smsService');
const Garage = require('../models/Garage');
const User = require('../models/User');
const Service = require('../models/Service');

// @desc    Créer un rendez-vous
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    // Seuls les clients peuvent créer des rendez-vous
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Seuls les clients peuvent créer des rendez-vous' });
    }

    let appointment = await Appointment.create({
      ...req.body,
      clientId: req.user._id,
    });
    
    appointment = await Appointment.findById(appointment._id)
      .populate('garageId', 'name address email ownerId')
      .populate('serviceId', 'name price');

    // Envoyer les notifications
    try {
      const [garage, service, client] = await Promise.all([
        Garage.findById(appointment.garageId),
        Service.findById(appointment.serviceId),
        User.findById(req.user._id),
      ]);

      if (garage && client) {
        // Email au client
        await emailService.sendAppointmentConfirmation(appointment, client, garage);
        
        // Email au garagiste
        const garagiste = await User.findById(garage.ownerId);
        if (garagiste && garage.email) {
          await emailService.sendNewAppointmentNotification(appointment, client, garage);
        }

        // SMS au client (optionnel)
        if (client.phone) {
          await smsService.sendAppointmentConfirmationSMS(appointment, client, garage);
        }
      }
    } catch (notifError) {
      console.error('Erreur notifications:', notifError);
      // Ne pas bloquer la création du rendez-vous si les notifications échouent
    }

    res.status(201).json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtenir tous les rendez-vous
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('clientId', 'name email phone')
      .populate('garageId', 'name address phone')
      .populate('serviceId', 'name category price')
      .sort({ date: -1, time: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir un rendez-vous par ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('clientId', 'name email phone')
      .populate('garageId', 'name address phone')
      .populate('serviceId', 'name category price');

    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour un rendez-vous
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    // Vérifier les permissions (client propriétaire ou garagiste du garage)
    const canUpdate =
      appointment.clientId.toString() === req.user._id.toString() ||
      (req.user.role === 'garagiste' &&
        appointment.garageId.toString() === req.user.garageId?.toString());

    if (!canUpdate) {
      return res.status(403).json({ message: 'Non autorisé à modifier ce rendez-vous' });
    }

    const oldStatus = appointment.status;
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('garageId clientId serviceId');

    // Envoyer notification si le statut a changé
    if (req.body.status && req.body.status !== oldStatus && updatedAppointment) {
      try {
        const garage = await Garage.findById(updatedAppointment.garageId);
        const client = await User.findById(updatedAppointment.clientId);

        if (req.body.status === 'confirmed' && client && garage) {
          await emailService.sendAppointmentConfirmation(updatedAppointment, client, garage);
          if (client.phone) {
            await smsService.sendAppointmentConfirmationSMS(updatedAppointment, client, garage);
          }
        }
      } catch (notifError) {
        console.error('Erreur notifications:', notifError);
      }
    }

    res.json({
      success: true,
      appointment: updatedAppointment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Supprimer un rendez-vous
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    // Vérifier les permissions
    const canDelete =
      appointment.clientId.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce rendez-vous' });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Rendez-vous supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les rendez-vous du client connecté
// @route   GET /api/appointments/client/me
// @access  Private/Client
exports.getClientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ clientId: req.user._id })
      .populate('garageId', 'name address phone')
      .populate('serviceId', 'name category price')
      .sort({ date: -1, time: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les rendez-vous du garage du garagiste connecté
// @route   GET /api/appointments/garage/me
// @access  Private/Garagiste
exports.getGarageAppointments = async (req, res) => {
  try {
    const Garage = require('../models/Garage');
    const garage = await Garage.findOne({ ownerId: req.user._id });

    if (!garage) {
      return res.status(404).json({ message: 'Aucun garage trouvé pour ce garagiste' });
    }

    const appointments = await Appointment.find({ garageId: garage._id })
      .populate('clientId', 'name email phone')
      .populate('serviceId', 'name category price')
      .sort({ date: -1, time: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

