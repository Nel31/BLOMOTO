const Service = require('../models/Service');
const Garage = require('../models/Garage');

// @desc    Obtenir tous les services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const { category, garageId } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (garageId) query.garageId = garageId;

    const services = await Service.find(query)
      .populate('garageId', 'name address location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir un service par ID
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('garageId');

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    res.json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les services d'un garage
// @route   GET /api/services/garage/:garageId
// @access  Public
exports.getServicesByGarage = async (req, res) => {
  try {
    const services = await Service.find({
      garageId: req.params.garageId,
      isActive: true,
    }).sort({ category: 1 });

    res.json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Créer un service
// @route   POST /api/services
// @access  Private/Garagiste/Admin
exports.createService = async (req, res) => {
  try {
    // Vérifier que le garage appartient au garagiste (si garagiste)
    if (req.user.role === 'garagiste') {
      const garage = await Garage.findOne({ ownerId: req.user._id });
      if (!garage) {
        return res.status(404).json({ message: 'Aucun garage trouvé pour ce garagiste' });
      }
      req.body.garageId = garage._id;
    }

    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mettre à jour un service
// @route   PUT /api/services/:id
// @access  Private/Garagiste/Admin
exports.updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    // Vérifier que le garagiste est le propriétaire du garage
    if (req.user.role === 'garagiste') {
      const garage = await Garage.findOne({ ownerId: req.user._id });
      if (!garage || garage._id.toString() !== service.garageId.toString()) {
        return res.status(403).json({ message: 'Non autorisé à modifier ce service' });
      }
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Supprimer un service
// @route   DELETE /api/services/:id
// @access  Private/Garagiste/Admin
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    // Vérifier que le garagiste est le propriétaire du garage
    if (req.user.role === 'garagiste') {
      const garage = await Garage.findOne({ ownerId: req.user._id });
      if (!garage || garage._id.toString() !== service.garageId.toString()) {
        return res.status(403).json({ message: 'Non autorisé à supprimer ce service' });
      }
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Service supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

