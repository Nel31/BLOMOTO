## Configuration des variables d'environnement

Utilisez ce fichier pour remplir votre `.env` backend. Dupliquez `.env.example`, renommez-le en `.env`, puis complétez les valeurs sensibles à l'aide des indications ci-dessous.

```
# Configuration du serveur
PORT=5000
NODE_ENV=development

# Base de données MongoDB Atlas
# IMPORTANT: Demandez l'URI complète au responsable technique ou consultez le gestionnaire de secrets
# Format: mongodb+srv://username:password@cluster.mongodb.net/promoto?retryWrites=true&w=majority
# Ne partagez JAMAIS cette URI publiquement !
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/promoto?retryWrites=true&w=majority

# JWT Secret
# Générez une clé secrète aléatoire pour la production
# Commande: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Cloudinary (pour le stockage d'images)
# Obtenez ces clés sur https://cloudinary.com/
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google Maps API (pour le backend si nécessaire)
# Obtenez cette clé sur https://console.cloud.google.com/
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# FedaPay Configuration (pour les paiements Mobile Money)
# Obtenez votre clé API sur https://fedapay.com
# Mode sandbox pour les tests, live pour la production
FEDAPAY_API_KEY=votre_api_key_fedapay
FEDAPAY_ENVIRONMENT=sandbox  # 'sandbox' pour les tests, 'live' pour la production

# Frontend URL (pour les callbacks de paiement)
FRONTEND_URL=http://localhost:5173
```

### Conseils

- **MONGODB_URI** : stockez l'URI réelle dans un gestionnaire de secrets; ne la committez jamais.
- **JWT_SECRET** : générez une valeur unique par environnement via la commande ci-dessus.
- **Cloudinary** : vous pouvez créer un compte gratuit pour obtenir les valeurs Cloud Name/API.
- **Google Maps** : restreignez la clé aux IP/domaines nécessaires dans la console Google Cloud.

