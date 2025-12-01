const { upload, uploadToCloudinary } = require('../utils/upload');
const cloudinaryUtil = require('../utils/cloudinary');

// @desc    Upload d'images pour garage
// @route   POST /api/upload/garage
// @access  Private/Garagiste/Admin
exports.uploadGarageImages = [
  upload.array('images', 10),
  uploadToCloudinary,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Aucune image fournie' });
      }

      const images = req.files.map((file) => ({
        url: file.cloudinaryUrl,
        publicId: file.cloudinaryPublicId,
      }));
      
      res.json({
        success: true,
        count: images.length,
        images: images.map(img => img.url),
        details: images,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

// @desc    Upload d'image de profil utilisateur
// @route   POST /api/upload/avatar
// @access  Private
exports.uploadAvatar = [
  upload.single('avatar'),
  uploadToCloudinary,
  async (req, res) => {
    try {
      if (!req.file || !req.file.cloudinaryUrl) {
        return res.status(400).json({ message: 'Aucune image fournie' });
      }

      res.json({
        success: true,
        avatar: req.file.cloudinaryUrl,
        publicId: req.file.cloudinaryPublicId,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

// @desc    Upload de photos de véhicule
// @route   POST /api/upload/vehicle
// @access  Private/Client
exports.uploadVehiclePhotos = [
  upload.array('photos', 5),
  uploadToCloudinary,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Aucune photo fournie' });
      }

      const photos = req.files.map((file) => ({
        url: file.cloudinaryUrl,
        publicId: file.cloudinaryPublicId,
      }));
      
      res.json({
        success: true,
        count: photos.length,
        photos: photos.map(photo => photo.url),
        details: photos,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

// @desc    Supprimer une image
// @route   DELETE /api/upload/:publicId
// @access  Private
exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    const fs = require('fs');
    const path = require('path');

    if (!publicId) {
      return res.status(400).json({ message: 'Public ID requis' });
    }

    // Supprimer le fichier local
    const filePath = path.join(__dirname, '..', publicId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'Image supprimée avec succès',
      });
    } else {
      res.status(404).json({ message: 'Image non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer une image par URL
// @route   DELETE /api/upload/url
// @access  Private
exports.deleteImageByUrl = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const fs = require('fs');
    const path = require('path');

    if (!imageUrl) {
      return res.status(400).json({ message: 'URL de l\'image requise' });
    }

    // Extraire le chemin relatif de l'URL
    // Format: http://localhost:5000/uploads/garages/filename.jpg
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
      res.json({
        success: true,
        message: 'Image supprimée avec succès',
      });
    } else {
      res.status(404).json({ message: 'Image non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

