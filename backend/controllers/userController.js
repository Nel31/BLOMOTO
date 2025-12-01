const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Fonction pour supprimer un fichier local à partir de son URL
const deleteLocalFileByUrl = (imageUrl) => {
  try {
    if (!imageUrl) return;
    let relativePath;
    try {
      const urlObj = new URL(imageUrl);
      relativePath = urlObj.pathname; // /uploads/garages/filename.jpg
    } catch (e) {
      // Si ce n'est pas une URL complète, traiter comme un chemin relatif
      relativePath = imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl;
    }
    const filePath = path.join(__dirname, '..', relativePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier local:', error);
  }
};

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour le profil de l'utilisateur connecté
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, deleteOldAvatar } = req.body;
    const user = await User.findById(req.user._id);

    // Supprimer l'ancien avatar si un nouveau est fourni ou si suppression demandée
    if ((avatar && user.avatar) || deleteOldAvatar) {
      if (user.avatar) {
        deleteLocalFileByUrl(user.avatar);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar: avatar || (deleteOldAvatar ? null : user.avatar) },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Changer le mot de passe de l'utilisateur connecté
// @route   PUT /api/users/profile/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Veuillez fournir le mot de passe actuel et le nouveau mot de passe' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les informations publiques d'un utilisateur (pour le chat)
// @route   GET /api/users/:id/public
// @access  Private
exports.getUserPublicInfo = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email avatar');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir un utilisateur par ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

