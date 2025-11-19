const { upload, uploadToCloudinary } = require('../utils/upload');

// @desc    Upload d'images pour garage
// @route   POST /api/upload/garage
// @access  Private/Garagiste/Admin
exports.uploadGarageImages = [
  upload.array('images', 10),
  uploadToCloudinary,
  async (req, res) => {
    try {
      const urls = req.files ? req.files.map((file) => file.cloudinaryUrl) : [];
      
      res.json({
        success: true,
        images: urls,
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
      const url = req.file?.cloudinaryUrl;
      
      if (!url) {
        return res.status(400).json({ message: 'Aucune image fournie' });
      }

      res.json({
        success: true,
        avatar: url,
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
      const urls = req.files ? req.files.map((file) => file.cloudinaryUrl) : [];
      
      res.json({
        success: true,
        photos: urls,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

