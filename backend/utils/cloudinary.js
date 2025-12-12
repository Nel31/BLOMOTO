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
 * @param {Object} options - Options supplémentaires (width, height, crop, etc.)
 * @returns {Promise<Object>} - Résultat avec URL de l'image
 */
exports.uploadImage = async (filePath, folder = 'promoto', options = {}) => {
  try {
    // Transformations par défaut selon le type de dossier
    let transformation = [];
    
    if (folder === 'avatars') {
      transformation = [
        { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
      ];
    } else if (folder === 'garages') {
      transformation = [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
      ];
    } else if (folder === 'vehicles') {
      transformation = [
        { width: 1000, height: 750, crop: 'limit', quality: 'auto' },
      ];
    } else {
      transformation = [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
      ];
    }

    // Permettre de surcharger les transformations
    if (options.transformation) {
      transformation = options.transformation;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `promoto/${folder}`,
      resource_type: 'image',
      transformation: transformation,
      format: 'auto', // Format automatique (webp si supporté)
      ...options,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
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
 * @param {String} publicId - Public ID de l'image à supprimer
 * @returns {Promise<Object>} - Résultat de la suppression
 */
exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Erreur lors de la suppression: ${error.message}`);
  }
};

/**
 * Supprimer une image à partir de son URL Cloudinary
 * @param {String} imageUrl - URL complète de l'image
 * @returns {Promise<Object>} - Résultat de la suppression
 */
exports.deleteImageByUrl = async (imageUrl) => {
  try {
    // Extraire le public_id de l'URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/promoto/folder/image.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      throw new Error('URL Cloudinary invalide');
    }

    // Prendre tout après 'upload' et avant l'extension
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, ''); // Retirer l'extension

    return await this.deleteImage(publicId);
  } catch (error) {
    throw new Error(`Erreur lors de la suppression par URL: ${error.message}`);
  }
};

/**
 * Supprimer plusieurs images
 * @param {Array<String>} publicIds - Tableau de public IDs
 * @returns {Promise<Object>} - Résultat de la suppression
 */
exports.deleteMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    throw new Error(`Erreur lors de la suppression multiple: ${error.message}`);
  }
};

/**
 * Upload un fichier (buffer) vers Cloudinary (pour PDFs, etc.)
 * @param {Buffer} buffer - Buffer du fichier
 * @param {String} folder - Dossier dans Cloudinary
 * @param {String} resourceType - Type de ressource ('image', 'raw', 'video', 'auto')
 * @returns {Promise<Object>} - Résultat avec URL du fichier
 */
exports.uploadToCloudinary = async (buffer, folder = 'promoto', resourceType = 'raw') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `promoto/${folder}`,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Erreur lors de l'upload Cloudinary: ${error.message}`));
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    throw new Error(`Erreur lors de l'upload Cloudinary: ${error.message}`);
  }
};

module.exports = exports;

