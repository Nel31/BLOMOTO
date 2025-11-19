const Favorite = require('../models/Favorite');
const Garage = require('../models/Garage');

// @desc    Ajouter un garage aux favoris
// @route   POST /api/favorites
// @access  Private/Client
exports.addFavorite = async (req, res) => {
  try {
    // Vérifier que c'est un client
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Seuls les clients peuvent ajouter des favoris' });
    }

    const { garageId } = req.body;

    // Vérifier que le garage existe
    const garage = await Garage.findById(garageId);
    if (!garage) {
      return res.status(404).json({ message: 'Garage non trouvé' });
    }

    // Vérifier si déjà en favori
    const existing = await Favorite.findOne({
      clientId: req.user._id,
      garageId,
    });

    if (existing) {
      return res.status(400).json({ message: 'Ce garage est déjà dans vos favoris' });
    }

    const favorite = await Favorite.create({
      clientId: req.user._id,
      garageId,
    });

    res.status(201).json({
      success: true,
      favorite,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Retirer un garage des favoris
// @route   DELETE /api/favorites/:garageId
// @access  Private/Client
exports.removeFavorite = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Seuls les clients peuvent retirer des favoris' });
    }

    const favorite = await Favorite.findOneAndDelete({
      clientId: req.user._id,
      garageId: req.params.garageId,
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favori non trouvé' });
    }

    res.json({
      success: true,
      message: 'Favori retiré avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir tous les favoris du client connecté
// @route   GET /api/favorites
// @access  Private/Client
exports.getFavorites = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Seuls les clients peuvent voir leurs favoris' });
    }

    const favorites = await Favorite.find({ clientId: req.user._id })
      .populate({
        path: 'garageId',
        populate: {
          path: 'ownerId',
          select: 'name email phone',
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vérifier si un garage est en favori
// @route   GET /api/favorites/check/:garageId
// @access  Private/Client
exports.checkFavorite = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.json({
        success: true,
        isFavorite: false,
      });
    }

    const favorite = await Favorite.findOne({
      clientId: req.user._id,
      garageId: req.params.garageId,
    });

    res.json({
      success: true,
      isFavorite: !!favorite,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

