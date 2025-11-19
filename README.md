# 🚗 Promoto - Application de mise en relation Automobilistes ↔ Garages

**Promoto** est une application mobile multiplateforme (Android & iOS) permettant aux automobilistes de trouver rapidement un garage automobile à proximité selon leurs besoins (panne, entretien, urgence, etc.).

## 📋 Table des matières

- [Technologies utilisées](#technologies-utilisées)
- [Structure du projet](#structure-du-projet)
- [Installation et démarrage](#installation-et-démarrage)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Fonctionnalités](#fonctionnalités)
- [Rôles utilisateurs](#rôles-utilisateurs)
 - [Frontend Web (Admin)](#frontend-web-admin)

## 🛠 Technologies utilisées

### Backend
- **Node.js** avec **Express.js**
- **MongoDB** (via Mongoose)
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe
- **Cloudinary** pour le stockage d'images (optionnel)

### Frontend (Mobile)
- **Flutter** (Dart)
- **Provider** pour la gestion d'état
- **Google Maps** pour la géolocalisation
- **Firebase** pour les notifications push (à configurer)
- **Dio** pour les appels API

## 📁 Structure du projet

```
PROMOTO/
├── backend/              # API Node.js/Express
│   ├── controllers/      # Contrôleurs des routes
│   ├── models/           # Modèles MongoDB
│   ├── routes/           # Définition des routes
│   ├── middleware/       # Middlewares (auth, validation)
│   ├── utils/            # Utilitaires (upload, token)
│   ├── server.js         # Point d'entrée du serveur
│   └── package.json
│
├── mobile/               # Application Flutter
│   ├── lib/
│   │   ├── models/       # Modèles de données
│   │   ├── providers/    # Providers (état)
│   │   ├── screens/      # Écrans de l'application
│   │   ├── utils/        # Utilitaires (API, thème)
│   │   └── main.dart     # Point d'entrée
│   └── pubspec.yaml
│
└── README.md
```

## 🚀 Installation et démarrage

### Prérequis

- **Node.js** (v18 ou supérieur)
- **MongoDB** (installation locale ou MongoDB Atlas)
- **Flutter SDK** (v3.0 ou supérieur)
- **Git**

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd PROMOTO
```

### 2. Backend - Configuration et démarrage

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Créer le fichier .env (copier depuis .env.example)
cp .env.example .env

# Modifier le fichier .env avec vos configurations
# - MONGODB_URI: votre URI MongoDB
# - JWT_SECRET: une clé secrète pour JWT
# - CLOUDINARY_*: vos clés Cloudinary (optionnel)

# Démarrer le serveur en mode développement
npm run dev

# Ou en mode production
npm start
```

Le serveur backend sera accessible sur `http://localhost:5000`

### 3. Mobile - Configuration et démarrage

```bash
# Aller dans le dossier mobile
cd mobile

# Installer les dépendances Flutter
flutter pub get

# Configurer l'URL de l'API dans lib/utils/api_client.dart
# Modifier la constante baseUrl selon votre environnement

# Lancer l'application sur un émulateur ou appareil
flutter run
```

**Note importante :** Pour la géolocalisation sur Android, ajouter dans `android/app/src/main/AndroidManifest.xml` :

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

Pour iOS, configurer `ios/Runner/Info.plist` :

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Promoto a besoin de votre localisation pour trouver les garages à proximité</string>
```

## ⚙️ Configuration

### Variables d'environnement Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/promoto
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Configuration de l'API dans Flutter

Modifier `mobile/lib/utils/api_client.dart` :

```dart
static const String baseUrl = 'http://YOUR_IP_ADDRESS:5000/api';
// Pour un émulateur Android : utiliser http://10.0.2.2:5000/api
// Pour un émulateur iOS : utiliser http://localhost:5000/api
// Pour un appareil physique : utiliser l'IP locale de votre machine
```

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur connecté (protégé)

### Utilisateurs
- `GET /api/users/profile` - Profil (protégé)
- `PUT /api/users/profile` - Mettre à jour le profil (protégé)
- `GET /api/users` - Liste des utilisateurs (Admin)
- `GET /api/users/:id` - Détails utilisateur (Admin)

### Garages
- `GET /api/garages/nearby?latitude=X&longitude=Y` - Garages à proximité
- `GET /api/garages` - Liste des garages
- `GET /api/garages/:id` - Détails d'un garage
- `GET /api/garages/owner/me` - Garage du garagiste connecté (protégé)
- `POST /api/garages` - Créer un garage (Admin)
- `PUT /api/garages/:id` - Mettre à jour (Garagiste/Admin)
- `DELETE /api/garages/:id` - Supprimer (Admin)

### Services
- `GET /api/services` - Liste des services
- `GET /api/services/garage/:garageId` - Services d'un garage
- `GET /api/services/:id` - Détails d'un service
- `POST /api/services` - Créer (Garagiste/Admin)
- `PUT /api/services/:id` - Mettre à jour (Garagiste/Admin)
- `DELETE /api/services/:id` - Supprimer (Garagiste/Admin)

### Rendez-vous
- `GET /api/appointments` - Liste (protégé)
- `GET /api/appointments/client/me` - Rendez-vous du client (protégé)
- `GET /api/appointments/garage/me` - Rendez-vous du garage (protégé/Garagiste)
- `POST /api/appointments` - Créer (protégé/Client)
- `PUT /api/appointments/:id` - Mettre à jour (protégé)
- `DELETE /api/appointments/:id` - Supprimer (protégé)

### Avis
- `GET /api/reviews` - Liste des avis
- `GET /api/reviews/garage/:garageId` - Avis d'un garage
- `POST /api/reviews` - Créer un avis (protégé/Client)
- `PUT /api/reviews/:id` - Mettre à jour (protégé)
- `DELETE /api/reviews/:id` - Supprimer (protégé)

### Admin
- `GET /api/admin/dashboard` - Statistiques (Admin)
- `POST /api/admin/garagistes` - Créer compte garagiste (Admin)
- `GET /api/admin/garagistes` - Liste des garagistes (Admin)
- `PUT /api/admin/garages/:id/suspend` - Suspendre un garage (Admin)
- `PUT /api/admin/garages/:id/activate` - Activer un garage (Admin)

## 🖥 Frontend Web (Admin)

### Démarrage

```bash
cd web
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev
```

L’interface admin sera accessible sur `http://localhost:5173`. Connectez‑vous avec un compte `admin`.

## ✨ Fonctionnalités

### Côté Client
- ✅ Création de compte / Connexion
- ✅ Géolocalisation automatique
- ✅ Recherche de garages à proximité
- ✅ Consultation des détails du garage
- ✅ Réservation de rendez-vous
- ✅ Historique des rendez-vous
- ✅ Évaluation et avis (à implémenter)

### Côté Garagiste
- ✅ Connexion (compte créé par l'admin)
- ✅ Gestion du profil garage (à implémenter complètement)
- ✅ Gestion des services (à implémenter)
- ✅ Gestion des rendez-vous (à implémenter)
- ✅ Consultation des avis (à implémenter)

### Côté Admin
- ✅ Dashboard avec statistiques
- ✅ Création de comptes garagistes
- ✅ Gestion des garages (suspendre/activer)
- ✅ Gestion des utilisateurs (à implémenter complètement)

## 👥 Rôles utilisateurs

| Rôle        | Description                          | Accès principal                              |
| ----------- | ------------------------------------ | -------------------------------------------- |
| **Client**  | Utilisateur de l'application        | Recherche, réservation, avis                 |
| **Garagiste** | Propriétaire d'un garage          | Gestion services, rendez-vous, profil garage |
| **Admin**   | Gestionnaire global                  | Supervision complète, création de comptes   |

## 📝 Notes importantes

1. **Premier utilisateur Admin** : Créer manuellement un utilisateur avec le rôle `admin` dans MongoDB ou via un script d'initialisation.

2. **Géolocalisation** : L'application nécessite des permissions de localisation sur l'appareil.

3. **Base URL API** : Pour tester sur un appareil physique, remplacer `localhost` par l'adresse IP locale de votre machine dans `api_client.dart`.

4. **Firebase** : Pour les notifications push, configurer Firebase dans le projet Flutter (voir la documentation Firebase).

5. **Cloudinary** : Optionnel, pour le stockage d'images. Vous pouvez utiliser un autre service ou un stockage local.

## 🔒 Sécurité

- Authentification JWT avec tokens
- Mots de passe hashés avec bcrypt
- Middlewares d'autorisation par rôle
- Validation des inputs côté serveur

## 🚧 Évolutions futures

- [ ] Paiement en ligne (Stripe, PayPal)
- [ ] Système de fidélité client
- [ ] Chat en direct client ↔ garagiste
- [ ] Version web de l'interface admin
- [ ] Recommandations automatiques
- [ ] Notifications push
- [ ] Filtrage avancé des garages
- [ ] Mode hors ligne avec synchronisation

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

## 👨‍💻 Développement

Pour contribuer au projet :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

**Développé avec ❤️ pour Promoto**

