# 🚀 Guide de Démarrage et Test - Promoto

Ce guide vous accompagne étape par étape pour créer la base de données, configurer l'application et tester toutes les fonctionnalités depuis zéro.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration de la base de données](#configuration-de-la-base-de-données)
4. [Création de l'utilisateur admin](#création-de-lutilisateur-admin)
5. [Configuration des services](#configuration-des-services)
6. [Démarrage de l'application](#démarrage-de-lapplication)
7. [Tests des fonctionnalités](#tests-des-fonctionnalités)
8. [Dépannage](#dépannage)

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- ✅ **Node.js** (version 18 ou supérieure)
- ✅ **MongoDB** (version 6 ou supérieure)
- ✅ **npm** ou **yarn**
- ✅ **Git**

### Vérification des installations

```bash
node --version    # Doit afficher v18.x.x ou supérieur
npm --version     # Doit afficher 9.x.x ou supérieur
mongod --version  # Doit afficher la version de MongoDB
```

---

## Installation

### 1. Cloner le projet (si ce n'est pas déjà fait)

```bash
git clone <url-du-repo>
cd PROMOTO
```

### 2. Installer les dépendances du backend

```bash
cd backend
npm install
```

### 3. Installer les dépendances du frontend

```bash
cd ../web
npm install
```

---

## Configuration de la base de données

### 1. Démarrer MongoDB

#### Sur Linux/Mac :

```bash
# Si MongoDB est installé comme service
sudo systemctl start mongod

# Ou manuellement
mongod --dbpath /path/to/data/directory
```

#### Sur Windows :

```bash
# Démarrer le service MongoDB depuis les Services Windows
# Ou depuis l'invite de commande :
net start MongoDB
```

### 2. Vérifier que MongoDB fonctionne

```bash
# Se connecter à MongoDB
mongosh

# Dans le shell MongoDB, tester la connexion
show dbs
```

### 3. Créer la base de données (optionnel)

MongoDB créera automatiquement la base de données au premier accès. Vous pouvez aussi la créer manuellement :

```bash
mongosh
use promoto
db.createCollection("test")
```

---

## Création de l'utilisateur admin

### Méthode 1 : Script automatique (Recommandé)

1. **Créer le fichier `.env` dans le dossier `backend/`**

```bash
cd backend
touch .env
```

2. **Ajouter les variables d'environnement dans `.env`**

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/promoto

# JWT Secret (changez cette valeur en production !)
JWT_SECRET=votre_secret_jwt_super_securise_changez_en_production

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Admin (pour le script seedAdmin)
ADMIN_NAME=Admin Promoto
ADMIN_EMAIL=admin@promoto.com
ADMIN_PASSWORD=Admin123!

# Note: Le mot de passe sera automatiquement hashé par bcrypt

# Server
PORT=5000
NODE_ENV=development

# Notifications
ENABLE_REMINDERS=true
```

3. **Exécuter le script de création d'admin**

```bash
cd backend
node utils/seedAdmin.js
```

Vous devriez voir :
```
Connecté à MongoDB
Admin créé: admin@promoto.com
```

### Méthode 2 : Création manuelle via MongoDB

```bash
mongosh
use promoto
```

```javascript
// Dans le shell MongoDB
db.users.insertOne({
  name: "Admin Promoto",
  email: "admin@promoto.com",
  password: "$2a$10$...", // Hash bcrypt de "Admin123!"
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

⚠️ **Note** : Pour la méthode 2, vous devez générer le hash bcrypt du mot de passe. Utilisez un outil en ligne ou Node.js :

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('Admin123!', 10);
console.log(hash);
```

### Méthode 3 : Création via l'API (après démarrage)

Une fois le serveur démarré, vous pouvez créer un admin via une requête HTTP (nécessite d'avoir déjà un admin ou de modifier temporairement le code).

---

## Configuration des services

### Configuration minimale (pour tester)

Pour démarrer rapidement, vous pouvez utiliser la configuration minimale. Certaines fonctionnalités seront désactivées mais l'application fonctionnera.

**Fichier `backend/.env` minimal :**

```env
MONGODB_URI=mongodb://localhost:27017/promoto
JWT_SECRET=votre_secret_jwt_super_securise
FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
ENABLE_REMINDERS=false
```

### Configuration complète (optionnel)

Pour activer toutes les fonctionnalités, consultez le fichier `CONFIGURATION.md` pour configurer :

- **Cloudinary** (upload d'images)
- **Email SMTP** (notifications par email)
- **Twilio** (SMS - optionnel)
- **Stripe** (paiements - optionnel)

---

## Démarrage de l'application

### 1. Démarrer le backend

```bash
cd backend
npm run dev
```

Vous devriez voir :
```
✅ Connexion à MongoDB réussie
🚀 Serveur démarré sur le port 5000
```

### 2. Démarrer le frontend (dans un autre terminal)

```bash
cd web
npm run dev
```

Vous devriez voir :
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 3. Vérifier que tout fonctionne

Ouvrez votre navigateur et allez sur :
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:5000

Vous devriez voir un message JSON sur l'API :
```json
{
  "message": "API Promoto - Bienvenue !",
  "version": "1.0.0"
}
```

---

## Tests des fonctionnalités

### 1. Test de connexion admin

1. Allez sur http://localhost:5173
2. Cliquez sur "Connexion"
3. Utilisez les identifiants :
   - **Email** : `admin@promoto.com`
   - **Mot de passe** : `Admin123!` (ou celui que vous avez défini)
4. Vous devriez être redirigé vers le dashboard admin

### 2. Test de création d'un client

1. Allez sur http://localhost:5173
2. Cliquez sur "Inscription"
3. Remplissez le formulaire :
   - Nom : Test Client
   - Email : client@test.com
   - Mot de passe : Test123!
   - Téléphone : 0123456789
4. Connectez-vous avec ce compte

### 3. Test de création d'un garagiste (via admin)

1. Connectez-vous en tant qu'admin
2. Allez dans "Gestion des Garagistes"
3. Cliquez sur "Créer un garagiste"
4. Remplissez le formulaire :
   - Nom du garage : Garage Test
   - Email : garagiste@test.com
   - Mot de passe : Test123!
   - Téléphone : 0123456789
   - Adresse : 123 Rue Test, 75001 Paris
5. Le garagiste et son garage seront créés automatiquement

### 4. Test de connexion garagiste

1. Déconnectez-vous de l'admin
2. Connectez-vous avec :
   - **Email** : `garagiste@test.com`
   - **Mot de passe** : `Test123!`
3. Vous devriez voir le dashboard garagiste

### 5. Test de création d'un service

1. En tant que garagiste, allez dans "Mes Services"
2. Cliquez sur "Ajouter un service"
3. Remplissez :
   - Nom : Révision complète
   - Description : Révision complète du véhicule
   - Catégorie : Entretien
   - Prix : 150
   - Durée : 120 (minutes)
4. Enregistrez

### 6. Test de recherche de garage (client)

1. Connectez-vous en tant que client
2. Allez dans "Trouver un garage"
3. Recherchez "Garage Test"
4. Cliquez sur le garage pour voir les détails
5. Vérifiez que le service créé apparaît

### 7. Test de réservation (client)

1. En tant que client, sur la page du garage
2. Cliquez sur "Réserver un rendez-vous"
3. Sélectionnez le service "Révision complète"
4. Choisissez une date et une heure
5. Remplissez les informations du véhicule
6. Confirmez la réservation

### 8. Test de gestion des rendez-vous (garagiste)

1. Connectez-vous en tant que garagiste
2. Allez dans "Mes Rendez-vous"
3. Vérifiez que le rendez-vous créé apparaît
4. Changez le statut (confirmé, en cours, terminé)

### 9. Test de messagerie

1. En tant que client, allez dans "Mes Rendez-vous"
2. Cliquez sur "Contacter le garagiste"
3. Envoyez un message
4. En tant que garagiste, allez dans "Messages"
5. Vérifiez que le message apparaît

### 10. Test de système d'avis

1. En tant que client, allez dans "Mes Rendez-vous"
2. Pour un rendez-vous terminé, cliquez sur "Laisser un avis"
3. Donnez une note et un commentaire
4. Vérifiez que l'avis apparaît sur la page du garage

---

## Vérification de la base de données

### Voir les collections créées

```bash
mongosh
use promoto
show collections
```

Vous devriez voir :
- `users`
- `garages`
- `services`
- `appointments`
- `reviews`
- `messages`
- `favorites`

### Vérifier les données

```javascript
// Voir tous les utilisateurs
db.users.find().pretty()

// Voir tous les garages
db.garages.find().pretty()

// Voir tous les rendez-vous
db.appointments.find().pretty()

// Compter les documents
db.users.countDocuments()
db.garages.countDocuments()
```

---

## Dépannage

### Problème : MongoDB ne démarre pas

**Solution :**
```bash
# Vérifier que MongoDB est installé
mongod --version

# Vérifier les logs
tail -f /var/log/mongodb/mongod.log

# Sur Linux, vérifier le service
sudo systemctl status mongod
```

### Problème : Erreur de connexion à MongoDB

**Erreur :** `MongoServerError: connect ECONNREFUSED`

**Solutions :**
1. Vérifier que MongoDB est démarré
2. Vérifier l'URI dans `.env` : `mongodb://localhost:27017/promoto`
3. Vérifier que le port 27017 n'est pas utilisé par un autre service

### Problème : Admin non créé

**Erreur :** `Admin déjà existant` ou aucune sortie

**Solutions :**
1. Vérifier que toutes les variables sont dans `.env`
2. Vérifier la connexion MongoDB
3. Vérifier manuellement dans MongoDB :
   ```javascript
   db.users.findOne({ role: "admin" })
   ```

### Problème : Port déjà utilisé

**Erreur :** `EADDRINUSE: address already in use :::5000`

**Solutions :**
1. Changer le port dans `.env` : `PORT=5001`
2. Ou arrêter le processus utilisant le port :
   ```bash
   # Linux/Mac
   lsof -ti:5000 | xargs kill
   
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### Problème : Erreur CORS

**Erreur :** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution :**
Vérifier que `FRONTEND_URL` dans `.env` correspond à l'URL du frontend (par défaut `http://localhost:5173`)

### Problème : Token JWT invalide

**Erreur :** `jwt malformed` ou `invalid token`

**Solutions :**
1. Vérifier que `JWT_SECRET` est défini dans `.env`
2. Se déconnecter et se reconnecter
3. Vider le localStorage du navigateur

### Problème : Images non uploadées

**Si Cloudinary n'est pas configuré :**
- Les uploads d'images ne fonctionneront pas
- Configurez Cloudinary dans `.env` (voir `CONFIGURATION.md`)
- Ou utilisez un service temporaire pour les tests

---

## Commandes utiles

### Réinitialiser la base de données

⚠️ **Attention :** Cela supprime toutes les données !

```bash
mongosh
use promoto
db.dropDatabase()
```

Puis recréez l'admin avec `node utils/seedAdmin.js`

### Voir les logs en temps réel

```bash
# Backend
cd backend
npm run dev

# MongoDB
tail -f /var/log/mongodb/mongod.log
```

### Tester l'API avec curl

```bash
# Test de l'API
curl http://localhost:5000

# Test de connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@promoto.com","password":"Admin123!"}'
```

---

## Prochaines étapes

Une fois que tout fonctionne :

1. ✅ Configurez Cloudinary pour les images
2. ✅ Configurez l'email SMTP pour les notifications
3. ✅ Configurez Stripe pour les paiements (optionnel)
4. ✅ Géocodez les adresses des garages (voir `INTEGRATION_MAP.md`)
5. ✅ Testez toutes les fonctionnalités
6. ✅ Préparez pour la production (voir `CONFIGURATION.md`)

---

## Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs du serveur
2. Vérifiez les logs MongoDB
3. Vérifiez la console du navigateur (F12)
4. Consultez `CONFIGURATION.md` pour la configuration avancée
5. Consultez `GUIDE_BACKEND.md` pour comprendre l'architecture

---

**Bon développement ! 🚀**

