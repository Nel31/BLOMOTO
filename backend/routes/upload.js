const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  uploadGarageImages,
  uploadAvatar,
  uploadVehiclePhotos,
} = require('../controllers/uploadController');

router.use(protect);

router.post('/garage', authorize('garagiste', 'admin'), uploadGarageImages);
router.post('/avatar', uploadAvatar);
router.post('/vehicle', authorize('client'), uploadVehiclePhotos);

module.exports = router;

