const Review = require('../models/Review');
const Garage = require('../models/Garage');

// @desc    Créer un avis
// @route   POST /api/reviews
// @access  Private/Client
exports.createReview = async (req, res) => {
  try {
    const { garageId, rating, comment, appointmentId } = req.body;

    // Vérifier que le garage existe
    const garage = await Garage.findById(garageId);
    if (!garage) {
      return res.status(404).json({ message: 'Garage non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà laissé un avis pour ce garage
    const existingReview = await Review.findOne({
      clientId: req.user._id,
      garageId,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Vous avez déjà laissé un avis pour ce garage' });
    }

    const review = await Review.create({
      clientId: req.user._id,
      garageId,
      rating,
      comment,
      appointmentId,
      isVerified: !!appointmentId, // Vérifié si basé sur un rendez-vous
    });

    // Mettre à jour la note moyenne du garage
    await updateGarageRating(garageId);

    res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtenir tous les avis
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('clientId', 'name avatar')
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

// @desc    Obtenir un avis par ID
// @route   GET /api/reviews/:id
// @access  Public
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('clientId', 'name avatar')
      .populate('garageId', 'name');

    if (!review) {
      return res.status(404).json({ message: 'Avis non trouvé' });
    }

    res.json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les avis d'un garage
// @route   GET /api/reviews/garage/:garageId
// @access  Public
exports.getReviewsByGarage = async (req, res) => {
  try {
    const reviews = await Review.find({ garageId: req.params.garageId })
      .populate('clientId', 'name avatar')
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

// @desc    Mettre à jour un avis
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Avis non trouvé' });
    }

    // Vérifier que l'utilisateur est le propriétaire de l'avis
    if (review.clientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à modifier cet avis' });
    }

    const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Mettre à jour la note moyenne du garage
    await updateGarageRating(review.garageId);

    res.json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Supprimer un avis
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Avis non trouvé' });
    }

    // Vérifier les permissions
    const canDelete =
      review.clientId.toString() === req.user._id.toString() || req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({ message: 'Non autorisé à supprimer cet avis' });
    }

    const garageId = review.garageId;

    await Review.findByIdAndDelete(req.params.id);

    // Mettre à jour la note moyenne du garage
    await updateGarageRating(garageId);

    res.json({
      success: true,
      message: 'Avis supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction helper pour mettre à jour la note moyenne d'un garage
async function updateGarageRating(garageId) {
  const reviews = await Review.find({ garageId });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  await Garage.findByIdAndUpdate(garageId, {
    'rating.average': Math.round(averageRating * 10) / 10, // Arrondir à 1 décimal
    'rating.count': reviews.length,
  });
}

