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

// Middleware pour stocker les images localement (Cloudinary désactivé temporairement)
const uploadToCloudinary = async (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  const files = req.files || (req.file ? [req.file] : []);
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

  try {
    // Déterminer le dossier selon la route
    let folder = req.body.folder || 'promoto';
    
    // Auto-détection du dossier selon la route
    if (req.path && req.path.includes('/garage')) {
      folder = 'garages';
    } else if (req.path && req.path.includes('/avatar')) {
      folder = 'avatars';
    } else if (req.path && req.path.includes('/vehicle')) {
      folder = 'vehicles';
    }

    // Créer le dossier de destination s'il n'existe pas
    const destinationFolder = path.join('uploads', folder);
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder, { recursive: true });
    }

    // Déplacer les fichiers vers le dossier de destination et générer les URLs locales
    const results = await Promise.all(files.map(async (file) => {
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      const destinationPath = path.join(destinationFolder, fileName);
      
      // Déplacer le fichier vers le dossier de destination
      fs.renameSync(file.path, destinationPath);
      
      // Générer l'URL locale
      const relativePath = path.join('uploads', folder, fileName).replace(/\\/g, '/');
      const url = `${baseUrl}/${relativePath}`;
      
      return {
        url: url,
        publicId: relativePath,
        width: null,
        height: null,
      };
    }));
    
    // Ajouter les URLs et publicIds aux requêtes
    if (req.file) {
      req.file.cloudinaryUrl = results[0].url;
      req.file.cloudinaryPublicId = results[0].publicId;
    }
    if (req.files) {
      req.files = req.files.map((file, index) => ({
        ...file,
        cloudinaryUrl: results[index].url,
        cloudinaryPublicId: results[index].publicId,
      }));
    }
    
    next();
  } catch (error) {
    // Nettoyer les fichiers temporaires en cas d'erreur
    files.forEach((file) => {
      if (fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Erreur lors de la suppression du fichier temporaire:', err);
        }
      }
    });
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { upload, uploadToCloudinary };

