const Garage = require('../models/Garage');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Review = require('../models/Review');
const { geocodeAddress } = require('../utils/geocoding');

// @desc    Obtenir les garages à proximité
// @route   GET /api/garages/nearby
// @access  Public
exports.getNearbyGarages = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance en mètres (défaut 10km)

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude et latitude requises' });
    }

    const garages = await Garage.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      isActive: true,
    })
      .populate('ownerId', 'name email phone')
      .sort({ 'rating.average': -1 });

    res.json({
      success: true,
      count: garages.length,
      garages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir tous les garages
// @route   GET /api/garages
// @access  Public
exports.getGarages = async (req, res) => {
  try {
    const { isActive, city, search, minRating } = req.query;
    let query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
      ];
    }

    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    const garages = await Garage.find(query)
      .populate('ownerId', 'name email phone')
      .sort({ 'rating.average': -1, createdAt: -1 });

    res.json({
      success: true,
      count: garages.length,
      garages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir un garage par ID
// @route   GET /api/garages/:id
// @access  Public
exports.getGarageById = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id).populate(
      'ownerId',
      'name email phone'
    );

    if (!garage) {
      return res.status(404).json({ message: 'Garage non trouvé' });
    }

    res.json({
      success: true,
      garage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les statistiques du dashboard garagiste
// @route   GET /api/garages/me/stats
// @access  Private/Garagiste
exports.getGarageStats = async (req, res) => {
  try {
    const garage = await Garage.findOne({ ownerId: req.user._id });

    if (!garage) {
      return res.status(404).json({ message: 'Aucun garage trouvé pour ce garagiste' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [
      totalAppointments,
      todayAppointments,
      thisMonthAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      totalServices,
      activeServices,
      totalReviews,
      recentReviews,
    ] = await Promise.all([
      Appointment.countDocuments({ garageId: garage._id }),
      Appointment.countDocuments({
        garageId: garage._id,
        date: { $gte: today, $lt: tomorrow },
      }),
      Appointment.countDocuments({
        garageId: garage._id,
        date: { $gte: thisMonth, $lt: nextMonth },
      }),
      Appointment.countDocuments({
        garageId: garage._id,
        status: 'pending',
      }),
      Appointment.countDocuments({
        garageId: garage._id,
        status: 'confirmed',
      }),
      Appointment.countDocuments({
        garageId: garage._id,
        status: 'completed',
      }),
      Service.countDocuments({ garageId: garage._id }),
      Service.countDocuments({ garageId: garage._id, isActive: true }),
      Review.countDocuments({ garageId: garage._id }),
      Review.find({ garageId: garage._id })
        .populate('clientId', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      success: true,
      stats: {
        garage: {
          id: garage._id,
          name: garage.name,
          rating: garage.rating,
          isVerified: garage.isVerified,
          isActive: garage.isActive,
        },
        appointments: {
          total: totalAppointments,
          today: todayAppointments,
          thisMonth: thisMonthAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
        },
        services: {
          total: totalServices,
          active: activeServices,
        },
        reviews: {
          total: totalReviews,
          recent: recentReviews,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir le garage du garagiste connecté
// @route   GET /api/garages/me
// @access  Private/Garagiste
exports.getMyGarage = async (req, res) => {
  try {
    const garage = await Garage.findOne({ ownerId: req.user._id }).populate(
      'ownerId',
      'name email phone'
    );

    if (!garage) {
      return res.status(404).json({ message: 'Aucun garage trouvé pour ce garagiste' });
    }

    res.json({
      success: true,
      garage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour le garage du garagiste
// @route   PUT /api/garages/me
// @access  Private/Garagiste
exports.updateMyGarage = async (req, res) => {
  try {
    const garage = await Garage.findOne({ ownerId: req.user._id });

    if (!garage) {
      return res.status(404).json({ message: 'Aucun garage trouvé pour ce garagiste' });
    }

    // Si l'adresse change, géocoder pour obtenir les nouvelles coordonnées
    if (req.body.address && (!req.body.location || !req.body.location.coordinates || req.body.location.coordinates[0] === 0)) {
      const addressToGeocode = req.body.address;
      const geocoded = await geocodeAddress(addressToGeocode);
      if (geocoded) {
        req.body.location = {
          type: 'Point',
          coordinates: geocoded.coordinates,
        };
      }
    }

    // Mise à jour du garage
    const updatedGarage = await Garage.findByIdAndUpdate(
      garage._id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('ownerId', 'name email phone');

    res.json({
      success: true,
      garage: updatedGarage,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtenir le garage par propriétaire
// @route   GET /api/garages/owner/me
// @access  Private/Garagiste
exports.getGarageByOwner = async (req, res) => {
  try {
    const garage = await Garage.findOne({ ownerId: req.user._id }).populate(
      'ownerId',
      'name email phone'
    );

    if (!garage) {
      return res.status(404).json({ message: 'Aucun garage trouvé pour ce garagiste' });
    }

    res.json({
      success: true,
      garage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Créer un garage
// @route   POST /api/garages
// @access  Private/Admin
exports.createGarage = async (req, res) => {
  try {
    const garage = await Garage.create(req.body);

    res.status(201).json({
      success: true,
      garage,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mettre à jour un garage
// @route   PUT /api/garages/:id
// @access  Private/Garagiste/Admin
exports.updateGarage = async (req, res) => {
  try {
    let garage = await Garage.findById(req.params.id);

    if (!garage) {
      return res.status(404).json({ message: 'Garage non trouvé' });
    }

    // Vérifier que le garagiste est le propriétaire du garage
    if (req.user.role === 'garagiste') {
      if (garage.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Non autorisé à modifier ce garage' });
      }
    }

    // Si l'adresse change, géocoder pour obtenir les nouvelles coordonnées
    if (req.body.address && (!req.body.location || !req.body.location.coordinates || req.body.location.coordinates[0] === 0)) {
      const addressToGeocode = req.body.address;
      const geocoded = await geocodeAddress(addressToGeocode);
      if (geocoded) {
        req.body.location = {
          type: 'Point',
          coordinates: geocoded.coordinates,
        };
      }
    }

    garage = await Garage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('ownerId', 'name email phone');

    res.json({
      success: true,
      garage,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Supprimer un garage
// @route   DELETE /api/garages/:id
// @access  Private/Admin
exports.deleteGarage = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);

    if (!garage) {
      return res.status(404).json({ message: 'Garage non trouvé' });
    }

    await Garage.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Garage supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
