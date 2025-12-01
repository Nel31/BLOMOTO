const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  uploadGarageImages,
  uploadAvatar,
  uploadVehiclePhotos,
  deleteImage,
  deleteImageByUrl,
} = require('../controllers/uploadController');

router.use(protect);

// Routes d'upload
router.post('/garage', authorize('garagiste', 'admin'), uploadGarageImages);
router.post('/avatar', uploadAvatar);
router.post('/vehicle', authorize('client'), uploadVehiclePhotos);

// Routes de suppression
router.delete('/:publicId', deleteImage);
router.delete('/url/delete', deleteImageByUrl);

module.exports = router;

