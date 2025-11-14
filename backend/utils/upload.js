const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Configuration de multer pour les uploads temporaires (avant upload vers Cloudinary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accepter uniquement les images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Middleware pour uploader vers Cloudinary après multer
const uploadToCloudinary = async (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  const cloudinaryUtil = require('./cloudinary');
  const files = req.files || (req.file ? [req.file] : []);

  try {
    const uploadPromises = files.map(async (file) => {
      const folder = req.body.folder || 'promoto';
      const result = await cloudinaryUtil.uploadImage(file.path, folder);
      
      // Supprimer le fichier temporaire après upload
      fs.unlinkSync(file.path);
      
      return result.url;
    });

    const urls = await Promise.all(uploadPromises);
    
    // Ajouter les URLs aux requêtes
    if (req.file) {
      req.file.cloudinaryUrl = urls[0];
    }
    if (req.files) {
      req.files = req.files.map((file, index) => ({
        ...file,
        cloudinaryUrl: urls[index],
      }));
    }
    
    next();
  } catch (error) {
    // Nettoyer les fichiers temporaires en cas d'erreur
    files.forEach((file) => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { upload, uploadToCloudinary };

