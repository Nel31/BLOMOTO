# 🏗️ Guide d'Architecture du Backend - Promoto

Ce guide explique l'architecture, la structure et le fonctionnement du backend de l'application Promoto.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Structure du projet](#structure-du-projet)
3. [Architecture](#architecture)
4. [Modèles de données](#modèles-de-données)
5. [Routes et contrôleurs](#routes-et-contrôleurs)
6. [Middleware](#middleware)
7. [Services et utilitaires](#services-et-utilitaires)
8. [Sécurité](#sécurité)
9. [Technologies utilisées](#technologies-utilisées)

---

## Vue d'ensemble

Le backend Promoto est une API REST construite avec **Node.js** et **Express**, utilisant **MongoDB** comme base de données. Il gère :

- ✅ Authentification et autorisation (JWT)
- ✅ Gestion des utilisateurs (clients, garagistes, admin)
- ✅ Gestion des garages et services
- ✅ Système de rendez-vous
- ✅ Système de messagerie en temps réel (Socket.io)
- ✅ Système de paiement (Stripe)
- ✅ Upload d'images (Cloudinary)
- ✅ Notifications par email et SMS

---

## Structure du projet

```
backend/
├── controllers/          # Logique métier
│   ├── adminController.js
│   ├── appointmentController.js
│   ├── authController.js
│   ├── favoriteController.js
│   ├── garageController.js
│   ├── messageController.js
│   ├── paymentController.js
│   ├── reviewController.js
│   ├── serviceController.js
│   ├── uploadController.js
│   └── userController.js
├── middleware/           # Middleware Express
│   └── auth.js          # Authentification et autorisation
├── models/              # Modèles Mongoose
│   ├── Appointment.js
│   ├── Favorite.js
│   ├── Garage.js
│   ├── Message.js
│   ├── Review.js
│   ├── Service.js
│   └── User.js
├── routes/              # Définition des routes
│   ├── admin.js
│   ├── appointments.js
│   ├── auth.js
│   ├── favorites.js
│   ├── garages.js
│   ├── messages.js
│   ├── payments.js
│   ├── reviews.js
│   ├── services.js
│   ├── upload.js
│   └── users.js
├── utils/               # Utilitaires et services
│   ├── cloudinary.js    # Configuration Cloudinary
│   ├── emailService.js  # Service d'envoi d'emails
│   ├── generateToken.js # Génération de tokens JWT
│   ├── geocoding.js     # Géocodage d'adresses
│   ├── notificationScheduler.js # Planification des rappels
│   ├── seedAdmin.js     # Script de création d'admin
│   ├── smsService.js    # Service d'envoi de SMS
│   └── upload.js        # Configuration Multer
├── uploads/             # Dossier temporaire pour uploads
├── server.js            # Point d'entrée de l'application
└── package.json         # Dépendances du projet
```

---

## Architecture

### Flux de requête

```
Client (Frontend)
    ↓
Route (routes/*.js)
    ↓
Middleware (auth.js) - Vérification JWT et rôles
    ↓
Contrôleur (controllers/*.js) - Logique métier
    ↓
Modèle (models/*.js) - Interaction avec MongoDB
    ↓
Réponse JSON
```

### Pattern MVC

Le backend suit le pattern **MVC (Model-View-Controller)** :

- **Models** : Définition des schémas de données (Mongoose)
- **Views** : JSON responses (pas de templates HTML)
- **Controllers** : Logique métier et traitement des requêtes

---

## Modèles de données

### User (Utilisateur)

Représente tous les utilisateurs de l'application (clients, garagistes, admin).

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashé),
  phone: String,
  role: 'client' | 'garagiste' | 'admin',
  avatar: String (URL Cloudinary),
  garageId: ObjectId (référence Garage, pour garagistes),
  isActive: Boolean
}
```

**Hooks** : Le mot de passe est automatiquement hashé avant sauvegarde avec bcrypt.

### Garage

Représente un garage automobile.

```javascript
{
  name: String,
  description: String,
  ownerId: ObjectId (référence User),
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  location: {
    type: 'Point',
    coordinates: [longitude, latitude] // Format GeoJSON
  },
  phone: String,
  email: String,
  website: String,
  images: [String], // URLs Cloudinary
  rating: {
    average: Number,
    count: Number
  },
  openingHours: {
    monday: { open, close, closed },
    // ... autres jours
  },
  isVerified: Boolean,
  isActive: Boolean
}
```

**Index géospatial** : `location` est indexé en 2dsphere pour les recherches de proximité.

### Service

Représente un service proposé par un garage.

```javascript
{
  name: String,
  description: String,
  category: String,
  price: Number,
  duration: Number (en minutes),
  garageId: ObjectId (référence Garage),
  isActive: Boolean
}
```

### Appointment (Rendez-vous)

Représente un rendez-vous entre un client et un garage.

```javascript
{
  clientId: ObjectId (référence User),
  garageId: ObjectId (référence Garage),
  serviceId: ObjectId (référence Service),
  date: Date,
  time: String,
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled',
  notes: String,
  vehicleInfo: {
    brand, model, year, licensePlate
  }
}
```

### Review (Avis)

Représente un avis laissé par un client sur un garage.

```javascript
{
  clientId: ObjectId (référence User),
  garageId: ObjectId (référence Garage),
  appointmentId: ObjectId (référence Appointment),
  rating: Number (1-5),
  comment: String,
  isVerified: Boolean
}
```

### Message

Représente un message dans le système de chat.

```javascript
{
  senderId: ObjectId (référence User),
  receiverId: ObjectId (référence User),
  appointmentId: ObjectId (référence Appointment, optionnel),
  content: String,
  isRead: Boolean
}
```

### Favorite

Représente un garage favori d'un client.

```javascript
{
  clientId: ObjectId (référence User),
  garageId: ObjectId (référence Garage)
}
```

---

## Routes et contrôleurs

### Routes d'authentification (`/api/auth`)

- `POST /register` - Inscription d'un client
- `POST /login` - Connexion
- `GET /me` - Obtenir l'utilisateur connecté

### Routes utilisateurs (`/api/users`)

- `GET /me` - Profil de l'utilisateur connecté
- `PUT /me` - Mettre à jour le profil
- `GET /:id/public` - Informations publiques d'un utilisateur

### Routes garages (`/api/garages`)

- `GET /` - Liste des garages (avec filtres)
- `GET /nearby` - Garages à proximité (géolocalisation)
- `GET /:id` - Détails d'un garage
- `GET /me` - Garage du garagiste connecté
- `PUT /me` - Mettre à jour son garage
- `GET /me/stats` - Statistiques du garage

### Routes services (`/api/services`)

- `GET /` - Liste des services (filtrés par garage)
- `GET /:id` - Détails d'un service
- `POST /` - Créer un service (garagiste)
- `PUT /:id` - Mettre à jour un service
- `DELETE /:id` - Supprimer un service

### Routes rendez-vous (`/api/appointments`)

- `GET /client/me` - Rendez-vous du client
- `GET /garage/me` - Rendez-vous du garage
- `POST /` - Créer un rendez-vous
- `PUT /:id` - Mettre à jour un rendez-vous
- `DELETE /:id` - Annuler un rendez-vous

### Routes avis (`/api/reviews`)

- `GET /` - Liste des avis (filtrés par garage)
- `POST /` - Créer un avis
- `PUT /:id` - Mettre à jour un avis
- `DELETE /:id` - Supprimer un avis

### Routes messages (`/api/messages`)

- `GET /conversations` - Liste des conversations
- `GET /conversation/:userId` - Messages avec un utilisateur
- `POST /` - Envoyer un message
- `GET /unread-count` - Nombre de messages non lus

### Routes admin (`/api/admin`)

- `GET /dashboard` - Statistiques du dashboard
- `GET /users` - Liste des utilisateurs
- `GET /garages` - Liste des garages
- `POST /garages` - Créer un garage
- `PUT /garages/:id/verify` - Vérifier un garage
- `POST /garagistes` - Créer un garagiste
- `GET /search-users-garages` - Rechercher utilisateurs/garages

---

## Middleware

### `auth.js`

Contient deux middlewares principaux :

#### `protect`

Vérifie la présence et la validité du token JWT dans les headers.

```javascript
// Utilisation
router.get('/protected-route', protect, controller);
```

#### `authorize(...roles)`

Vérifie que l'utilisateur a l'un des rôles autorisés.

```javascript
// Utilisation
router.get('/admin-route', protect, authorize('admin'), controller);
router.get('/garage-route', protect, authorize('garagiste', 'admin'), controller);
```

---

## Services et utilitaires

### `generateToken.js`

Génère un token JWT avec l'ID de l'utilisateur.

### `cloudinary.js`

Configuration Cloudinary pour l'upload d'images. Les images sont automatiquement optimisées et stockées dans le cloud.

### `emailService.js`

Service d'envoi d'emails via SMTP (Nodemailer). Utilisé pour :
- Confirmations de rendez-vous
- Rappels de rendez-vous
- Notifications diverses

### `smsService.js`

Service d'envoi de SMS via Twilio (optionnel). Utilisé pour :
- Rappels de rendez-vous par SMS

### `geocoding.js`

Géocodage d'adresses via l'API Nominatim (OpenStreetMap). Convertit une adresse en coordonnées GPS.

### `notificationScheduler.js`

Planifie les rappels de rendez-vous avec `node-cron`. Envoie des emails/SMS 24h avant le rendez-vous.

### `seedAdmin.js`

Script pour créer un utilisateur admin initial dans la base de données.

---

## Sécurité

### Authentification JWT

- Les tokens JWT sont signés avec un secret (`JWT_SECRET`)
- Durée de vie configurable
- Stockés côté client (localStorage)

### Hashage des mots de passe

- Utilisation de `bcryptjs` avec un salt de 10 rounds
- Hashage automatique avant sauvegarde (hook Mongoose)

### Validation des données

- Validation des schémas Mongoose
- Validation Joi pour certaines routes
- Sanitization des entrées utilisateur

### CORS

- Configuration CORS pour autoriser uniquement le frontend spécifié
- Headers de sécurité configurés

### Protection des routes

- Routes protégées avec middleware `protect`
- Autorisation par rôle avec middleware `authorize`
- Vérification des permissions (ex: un garagiste ne peut modifier que son propre garage)

---

## Technologies utilisées

### Core

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB

### Authentification

- **jsonwebtoken** - Génération et vérification de tokens JWT
- **bcryptjs** - Hashage des mots de passe

### Communication temps réel

- **Socket.io** - WebSockets pour le chat en temps réel

### Upload et stockage

- **Cloudinary** - Stockage et optimisation d'images
- **Multer** - Gestion des uploads de fichiers

### Paiements

- **Stripe** - Intégration des paiements en ligne

### Notifications

- **Nodemailer** - Envoi d'emails
- **Twilio** - Envoi de SMS (optionnel)
- **node-cron** - Planification de tâches

### Utilitaires

- **dotenv** - Gestion des variables d'environnement
- **cors** - Configuration CORS
- **joi** - Validation de schémas

---

## Bonnes pratiques

### Gestion des erreurs

- Utilisation de try/catch dans tous les contrôleurs
- Messages d'erreur explicites
- Codes de statut HTTP appropriés

### Code modulaire

- Séparation des responsabilités (routes, contrôleurs, modèles)
- Réutilisation du code (middleware, utilitaires)
- DRY (Don't Repeat Yourself)

### Performance

- Index MongoDB pour les requêtes fréquentes
- Index géospatial pour les recherches de proximité
- Pagination pour les listes

### Sécurité

- Validation des entrées
- Protection contre les injections
- Hashage des mots de passe
- Tokens JWT sécurisés

---

## Points d'attention

1. **Variables d'environnement** : Ne jamais commiter le fichier `.env`
2. **JWT_SECRET** : Utiliser un secret fort en production
3. **Rate limiting** : Considérer l'ajout d'un rate limiter pour les API publiques
4. **Logging** : Implémenter un système de logs pour le monitoring
5. **Tests** : Ajouter des tests unitaires et d'intégration
6. **Documentation API** : Considérer l'ajout de Swagger/OpenAPI

---

## Prochaines améliorations possibles

- [ ] Ajout de tests unitaires et d'intégration
- [ ] Documentation API avec Swagger
- [ ] Rate limiting
- [ ] Système de logs avancé
- [ ] Cache Redis pour améliorer les performances
- [ ] Webhooks pour les paiements Stripe
- [ ] Système de notifications push
- [ ] API GraphQL en complément de REST

