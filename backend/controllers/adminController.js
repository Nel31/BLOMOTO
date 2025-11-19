const User = require('../models/User');
const Garage = require('../models/Garage');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Service = require('../models/Service');
const generateToken = require('../utils/generateToken');

// @desc    Obtenir les statistiques avancées du dashboard
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers,
      totalClients,
      totalGaragistes,
      totalGarages,
      totalAppointments,
      totalReviews,
      activeGarages,
      verifiedGarages,
      todayUsers,
      last7DaysUsers,
      thisMonthUsers,
      lastMonthUsers,
      todayGarages,
      last7DaysGarages,
      thisMonthGarages,
      lastMonthGarages,
      todayAppointments,
      last7DaysAppointments,
      thisMonthAppointments,
      lastMonthAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      todayReviews,
      last7DaysReviews,
      thisMonthReviews,
      recentUsers,
      recentGarages,
      recentAppointments,
      recentReviews,
      topGarages,
      averageRating,
      totalServices,
      activeServices,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'garagiste' }),
      Garage.countDocuments(),
      Appointment.countDocuments(),
      Review.countDocuments(),
      Garage.countDocuments({ isActive: true }),
      Garage.countDocuments({ isVerified: true }),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: last7Days } }),
      User.countDocuments({ createdAt: { $gte: thisMonth } }),
      User.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      Garage.countDocuments({ createdAt: { $gte: today } }),
      Garage.countDocuments({ createdAt: { $gte: last7Days } }),
      Garage.countDocuments({ createdAt: { $gte: thisMonth } }),
      Garage.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      Appointment.countDocuments({ createdAt: { $gte: today } }),
      Appointment.countDocuments({ createdAt: { $gte: last7Days } }),
      Appointment.countDocuments({ createdAt: { $gte: thisMonth } }),
      Appointment.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Review.countDocuments({ createdAt: { $gte: today } }),
      Review.countDocuments({ createdAt: { $gte: last7Days } }),
      Review.countDocuments({ createdAt: { $gte: thisMonth } }),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
      Garage.find().sort({ createdAt: -1 }).limit(5).populate('ownerId', 'name email'),
      Appointment.find().sort({ createdAt: -1 }).limit(10).populate('clientId', 'name email').populate('garageId', 'name').populate('serviceId', 'name'),
      Review.find().sort({ createdAt: -1 }).limit(10).populate('clientId', 'name avatar').populate('garageId', 'name'),
      Garage.find({ 'rating.count': { $gt: 0 } }).sort({ 'rating.average': -1 }).limit(10).select('name rating isVerified'),
      Review.aggregate([{ $group: { _id: null, avgRating: { $avg: '$rating' } } }]),
      Service.countDocuments(),
      Service.countDocuments({ isActive: true }),
    ]);

    const avgRatingResult = averageRating.length > 0 ? averageRating[0].avgRating : 0;

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          clients: totalClients,
          garagistes: totalGaragistes,
          admins: totalUsers - totalClients - totalGaragistes,
          growth: {
            today: todayUsers,
            last7Days: last7DaysUsers,
            thisMonth: thisMonthUsers,
            lastMonth: lastMonthUsers,
          },
        },
        garages: {
          total: totalGarages,
          active: activeGarages,
          verified: verifiedGarages,
          unverified: totalGarages - verifiedGarages,
          growth: {
            today: todayGarages,
            last7Days: last7DaysGarages,
            thisMonth: thisMonthGarages,
            lastMonth: lastMonthGarages,
          },
        },
        appointments: {
          total: totalAppointments,
          byStatus: {
            pending: pendingAppointments,
            confirmed: confirmedAppointments,
            completed: completedAppointments,
            cancelled: cancelledAppointments,
          },
          growth: {
            today: todayAppointments,
            last7Days: last7DaysAppointments,
            thisMonth: thisMonthAppointments,
            lastMonth: lastMonthAppointments,
          },
        },
        reviews: {
          total: totalReviews,
          averageRating: avgRatingResult,
          growth: {
            today: todayReviews,
            last7Days: last7DaysReviews,
            thisMonth: thisMonthReviews,
          },
        },
        services: {
          total: totalServices,
          active: activeServices,
        },
        recent: {
          users: recentUsers,
          garages: recentGarages,
          appointments: recentAppointments,
          reviews: recentReviews,
        },
        topGarages: topGarages,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Créer un compte garagiste
// @route   POST /api/admin/garagistes
// @access  Private/Admin
exports.createGaragisteAccount = async (req, res) => {
  try {
    const { name, email, password, phone, address, city, postalCode, location } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "L'utilisateur existe déjà" });
    }

    // Le nom fourni est le nom du garage, pas du garagiste
    // Créer l'utilisateur garagiste avec l'email comme nom par défaut
    const garagiste = await User.create({
      name: email.split('@')[0], // Utiliser la partie avant @ de l'email comme nom
      email,
      password,
      phone,
      role: 'garagiste',
    });

    // Créer automatiquement le garage avec le nom fourni
    // Si les champs d'adresse ne sont pas fournis, utiliser des valeurs par défaut
    const garageData = {
      name, // Le nom fourni est le nom du garage
      ownerId: garagiste._id,
      address: {
        street: address || 'À définir',
        city: city || 'À définir',
        postalCode: postalCode || '00000',
        country: 'France',
      },
      location: location ? {
        type: 'Point',
        coordinates: location.coordinates || [0, 0],
      } : {
        type: 'Point',
        coordinates: [0, 0], // Coordonnées par défaut (à mettre à jour plus tard)
      },
      phone: phone || email, // Utiliser l'email si pas de téléphone
      email: email,
      isActive: true,
      isVerified: false,
    };

    const garage = await Garage.create(garageData);

    // Mettre à jour l'utilisateur avec l'ID du garage
    garagiste.garageId = garage._id;
    await garagiste.save();

    res.status(201).json({
      success: true,
      message: 'Compte garagiste et garage créés avec succès',
      garagiste: {
        id: garagiste._id,
        name: garagiste.name,
        email: garagiste.email,
        role: garagiste.role,
        garageId: garagiste.garageId,
      },
      garage: {
        id: garage._id,
        name: garage.name,
        address: garage.address,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtenir tous les garagistes
// @route   GET /api/admin/garagistes
// @access  Private/Admin
exports.getAllGaragistes = async (req, res) => {
  try {
    const garagistes = await User.find({ role: 'garagiste' })
      .select('-password')
      .populate('garageId', 'name address isVerified isActive')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: garagistes.length,
      garagistes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Suspendre un garage
// @route   PUT /api/admin/garages/:id/suspend
// @access  Private/Admin
exports.suspendGarage = async (req, res) => {
  try {
    const garage = await Garage.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!garage) {
      return res.status(404).json({ message: 'Garage non trouvé' });
    }

    res.json({
      success: true,
      message: 'Garage suspendu avec succès',
      garage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Activer un garage
// @route   PUT /api/admin/garages/:id/activate
// @access  Private/Admin
exports.activateGarage = async (req, res) => {
  try {
    const garage = await Garage.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!garage) {
      return res.status(404).json({ message: 'Garage non trouvé' });
    }

    res.json({
      success: true,
      message: 'Garage activé avec succès',
      garage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vérifier un garage
// @route   PUT /api/admin/garages/:id/verify
// @access  Private/Admin
exports.verifyGarage = async (req, res) => {
  try {
    const garage = await Garage.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!garage) {
      return res.status(404).json({ message: 'Garage non trouvé' });
    }

    res.json({
      success: true,
      message: 'Garage vérifié avec succès',
      garage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dévérifier un garage
// @route   PUT /api/admin/garages/:id/unverify
// @access  Private/Admin
exports.unverifyGarage = async (req, res) => {
  try {
    const garage = await Garage.findByIdAndUpdate(
      req.params.id,
      { isVerified: false },
      { new: true }
    );

    if (!garage) {
      return res.status(404).json({ message: 'Garage non trouvé' });
    }

    res.json({
      success: true,
      message: 'Vérification du garage retirée',
      garage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer un garagiste
// @route   DELETE /api/admin/garagistes/:id
// @access  Private/Admin
exports.deleteGaragiste = async (req, res) => {
  try {
    const garagiste = await User.findById(req.params.id);

    if (!garagiste) {
      return res.status(404).json({ message: 'Garagiste non trouvé' });
    }

    if (garagiste.role !== 'garagiste') {
      return res.status(400).json({ message: 'Cet utilisateur n\'est pas un garagiste' });
    }

    // Supprimer le garage associé s'il existe
    if (garagiste.garageId) {
      await Garage.findByIdAndDelete(garagiste.garageId);
    }

    // Supprimer le garagiste
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Garagiste supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir tous les rendez-vous (admin)
// @route   GET /api/admin/appointments
// @access  Private/Admin
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, garageId, clientId, dateFrom, dateTo } = req.query;
    const query = {};

    if (status) query.status = status;
    if (garageId) query.garageId = garageId;
    if (clientId) query.clientId = clientId;
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const appointments = await Appointment.find(query)
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

// @desc    Obtenir tous les avis (admin)
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const { garageId, rating, verified } = req.query;
    const query = {};

    if (garageId) query.garageId = garageId;
    if (rating) query.rating = parseInt(rating);
    if (verified !== undefined) query.isVerified = verified === 'true';

    const reviews = await Review.find(query)
      .populate('clientId', 'name email avatar')
      .populate('garageId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer un avis (admin)
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Avis non trouvé' });
    }

    await Review.findByIdAndDelete(req.params.id);

    // Mettre à jour la note du garage
    const ReviewModel = require('../models/Review');
    const GarageModel = require('../models/Garage');
    const reviews = await ReviewModel.find({ garageId: review.garageId });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await GarageModel.findByIdAndUpdate(review.garageId, {
      'rating.average': avgRating,
      'rating.count': reviews.length,
    });

    res.json({
      success: true,
      message: 'Avis supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir tous les services (admin)
// @route   GET /api/admin/services
// @access  Private/Admin
exports.getAllServices = async (req, res) => {
  try {
    const { category, garageId, isActive } = req.query;
    const query = {};

    if (category) query.category = category;
    if (garageId) query.garageId = garageId;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const services = await Service.find(query)
      .populate('garageId', 'name address')
      .sort({ createdAt: -1 });

    const categories = await Service.distinct('category');
    const categoryStats = await Promise.all(
      categories.map(async (cat) => ({
        category: cat,
        count: await Service.countDocuments({ category: cat }),
      }))
    );

    res.json({
      success: true,
      count: services.length,
      services,
      categories: categoryStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les analytics et rapports
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    // Données pour graphiques
    const dailyStats = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [users, garages, appointments, reviews] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } }),
        Garage.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } }),
        Appointment.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } }),
        Review.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } }),
      ]);

      dailyStats.push({
        date: dayStart.toISOString().split('T')[0],
        users,
        garages,
        appointments,
        reviews,
      });
    }

    // Top garages
    const topGaragesByAppointments = await Appointment.aggregate([
      { $group: { _id: '$garageId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'garages',
          localField: '_id',
          foreignField: '_id',
          as: 'garage',
        },
      },
      { $unwind: '$garage' },
      { $project: { garageId: '$_id', count: 1, name: '$garage.name', rating: '$garage.rating' } },
    ]);

    // Répartition géographique
    const garagesByCity = await Garage.aggregate([
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Services les plus populaires
    const popularServices = await Appointment.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: '$service' },
      { $group: { _id: '$service.name', category: { $first: '$service.category' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      analytics: {
        dailyStats,
        topGaragesByAppointments,
        garagesByCity,
        popularServices,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
