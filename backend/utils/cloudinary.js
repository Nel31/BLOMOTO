const cloudinary = require('cloudinary').v2;

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload une image vers Cloudinary
 * @param {String} filePath - Chemin du fichier temporaire
 * @param {String} folder - Dossier dans Cloudinary (garages, vehicles, avatars, etc.)
 * @returns {Promise<Object>} - Résultat avec URL de l'image
 */
exports.uploadImage = async (filePath, folder = 'promoto') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    throw new Error(`Erreur lors de l'upload Cloudinary: ${error.message}`);
  }
};

/**
 * Upload multiple images
 */
exports.uploadMultipleImages = async (filePaths, folder = 'promoto') => {
  try {
    const uploadPromises = filePaths.map((filePath) =>
      this.uploadImage(filePath, folder)
    );
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Erreur lors de l'upload multiple: ${error.message}`);
  }
};

/**
 * Supprimer une image de Cloudinary
 */
exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Erreur lors de la suppression: ${error.message}`);
  }
};

module.exports = exports;

