const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour vérifier le token JWT
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Vérifier si le token est présent dans les headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Non autorisé - Token manquant' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur (sans le mot de passe)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé - Utilisateur non trouvé' });
    }

    if (!req.user.isActive) {
      return res.status(401).json({ message: 'Non autorisé - Compte désactivé' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Non autorisé - Token invalide' });
  }
};

// Middleware pour vérifier les rôles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Rôle ${req.user.role} non autorisé à accéder à cette ressource`,
      });
    }
    next();
  };
};

