# Analyse Détaillée de la Base de Données - Promoto Backend

## Vue d'ensemble

**Type de base de données :** MongoDB (NoSQL)  
**ODM :** Mongoose (v8.0.3)  
**Nom de la base :** `promoto` (par défaut)  
**URI de connexion :** Configurée via `MONGODB_URI` dans les variables d'environnement

---

## Architecture de la Base de Données

La base de données est composée de **7 collections principales** avec des relations bien définies :

1. **Users** - Utilisateurs de la plateforme
2. **Garages** - Garages automobiles
3. **Services** - Services proposés par les garages
4. **Appointments** - Rendez-vous clients/garages
5. **Reviews** - Avis clients sur les garages
6. **Favorites** - Garages favoris des clients
7. **Messages** - Système de messagerie en temps réel

---

## Collections Détaillées

### 1. Collection `users`

**Description :** Gère tous les utilisateurs de la plateforme (clients, garagistes, admins)

**Schéma :**
```javascript
{
  name: String (requis, trim)
  email: String (requis, unique, lowercase, validation regex)
  password: String (requis, min 6 caractères, hashé avec bcrypt, select: false)
  phone: String (optionnel, trim)
  role: String (enum: 'client' | 'garagiste' | 'admin', défaut: 'client')
  avatar: String (URL Cloudinary, optionnel)
  isActive: Boolean (défaut: true)
  garageId: ObjectId (référence vers Garage, optionnel, pour les garagistes)
  createdAt: Date (automatique)
  updatedAt: Date (automatique)
}
```

**Caractéristiques :**
- ✅ Hashage automatique du mot de passe avec bcrypt (10 rounds) avant sauvegarde
- ✅ Méthode `comparePassword()` pour la vérification des mots de passe
- ✅ Index unique sur `email`
- ✅ Relation bidirectionnelle avec `Garage` via `garageId`
- ✅ Support de 3 rôles distincts avec permissions différentes

**Relations :**
- `garageId` → `Garage` (One-to-One, optionnel)
- Référencé par : `Garage.ownerId`, `Appointment.clientId`, `Review.clientId`, `Favorite.clientId`, `Message.senderId/receiverId`

---

### 2. Collection `garages`

**Description :** Représente les garages automobiles enregistrés sur la plateforme

**Schéma :**
```javascript
{
  name: String (requis, trim)
  description: String (optionnel, trim)
  ownerId: ObjectId (requis, référence User)
  address: {
    street: String (requis)
    city: String (requis)
    postalCode: String (requis)
    country: String (défaut: 'France')
  }
  location: {
    type: String (enum: 'Point', défaut: 'Point')
    coordinates: [Number] (requis, [longitude, latitude])
  }
  phone: String (requis)
  email: String (optionnel, lowercase, trim)
  website: String (optionnel)
  images: [String] (URLs Cloudinary)
  rating: {
    average: Number (défaut: 0, min: 0, max: 5)
    count: Number (défaut: 0)
  }
  openingHours: {
    monday: { open: String, close: String, closed: Boolean (défaut: false) }
    tuesday: { open: String, close: String, closed: Boolean (défaut: false) }
    wednesday: { open: String, close: String, closed: Boolean (défaut: false) }
    thursday: { open: String, close: String, closed: Boolean (défaut: false) }
    friday: { open: String, close: String, closed: Boolean (défaut: false) }
    saturday: { open: String, close: String, closed: Boolean (défaut: false) }
    sunday: { open: String, close: String, closed: Boolean (défaut: false) }
  }
  isVerified: Boolean (défaut: false)
  isActive: Boolean (défaut: true)
  createdAt: Date (automatique)
  updatedAt: Date (automatique)
}
```

**Caractéristiques :**
- ✅ **Index géospatial 2dsphere** sur `location` pour recherches de proximité
- ✅ Système de notation intégré (moyenne + nombre d'avis)
- ✅ Horaires d'ouverture détaillés par jour de la semaine
- ✅ Support de multiples images
- ✅ Système de vérification des garages (`isVerified`)

**Relations :**
- `ownerId` → `User` (Many-to-One, requis)
- Référencé par : `User.garageId`, `Service.garageId`, `Appointment.garageId`, `Review.garageId`, `Favorite.garageId`

**Index :**
- `location: '2dsphere'` - Pour les requêtes géospatiales (recherche par proximité)

---

### 3. Collection `services`

**Description :** Services proposés par les garages (réparation, entretien, etc.)

**Schéma :**
```javascript
{
  garageId: ObjectId (requis, référence Garage)
  name: String (requis, trim)
  description: String (optionnel, trim)
  category: String (requis, enum: [
    'reparation',
    'entretien',
    'depannage',
    'vente-pieces',
    'carrosserie',
    'peinture',
    'revision',
    'autre'
  ])
  price: Number (optionnel, min: 0)
  priceType: String (enum: 'fixe' | 'variable' | 'sur-devis', défaut: 'variable')
  duration: Number (optionnel, durée en minutes, min: 0)
  isActive: Boolean (défaut: true)
  createdAt: Date (automatique)
  updatedAt: Date (automatique)
}
```

**Caractéristiques :**
- ✅ 8 catégories de services prédéfinies
- ✅ 3 types de tarification (fixe, variable, sur devis)
- ✅ Durée estimée en minutes
- ✅ Possibilité de désactiver un service sans le supprimer

**Relations :**
- `garageId` → `Garage` (Many-to-One, requis)
- Référencé par : `Appointment.serviceId`

**Catégories disponibles :**
- `reparation` - Réparations mécaniques
- `entretien` - Entretien régulier
- `depannage` - Dépannage d'urgence
- `vente-pieces` - Vente de pièces détachées
- `carrosserie` - Travaux de carrosserie
- `peinture` - Peinture automobile
- `revision` - Révisions techniques
- `autre` - Autres services

---

### 4. Collection `appointments`

**Description :** Rendez-vous entre clients et garages pour des services

**Schéma :**
```javascript
{
  clientId: ObjectId (requis, référence User)
  garageId: ObjectId (requis, référence Garage)
  serviceId: ObjectId (requis, référence Service)
  date: Date (requis)
  time: String (requis)
  status: String (enum: [
    'pending',
    'confirmed',
    'in-progress',
    'completed',
    'cancelled'
  ], défaut: 'pending')
  paymentStatus: String (enum: [
    'pending',
    'paid',
    'refunded',
    'failed'
  ], défaut: 'pending')
  paymentIntentId: String (optionnel, ID Stripe)
  totalAmount: Number (optionnel, min: 0)
  notes: String (optionnel, trim)
  vehicleInfo: {
    brand: String (optionnel)
    model: String (optionnel)
    year: Number (optionnel)
    licensePlate: String (optionnel)
    photos: [String] (URLs Cloudinary)
  }
  createdAt: Date (automatique)
  updatedAt: Date (automatique)
}
```

**Caractéristiques :**
- ✅ Système de statut complet (5 états)
- ✅ Intégration Stripe pour les paiements (`paymentIntentId`)
- ✅ Suivi du statut de paiement séparé
- ✅ Informations détaillées sur le véhicule
- ✅ Support de photos du véhicule
- ✅ Notes optionnelles pour communication

**Relations :**
- `clientId` → `User` (Many-to-One, requis)
- `garageId` → `Garage` (Many-to-One, requis)
- `serviceId` → `Service` (Many-to-One, requis)
- Référencé par : `Review.appointmentId`, `Message.appointmentId`

**Statuts :**
- `pending` - En attente de confirmation
- `confirmed` - Confirmé par le garage
- `in-progress` - En cours de réalisation
- `completed` - Terminé
- `cancelled` - Annulé

**Statuts de paiement :**
- `pending` - Non payé
- `paid` - Payé
- `refunded` - Remboursé
- `failed` - Échec du paiement

---

### 5. Collection `reviews`

**Description :** Avis et notes laissés par les clients sur les garages

**Schéma :**
```javascript
{
  clientId: ObjectId (requis, référence User)
  garageId: ObjectId (requis, référence Garage)
  appointmentId: ObjectId (optionnel, référence Appointment)
  rating: Number (requis, min: 1, max: 5)
  comment: String (optionnel, trim)
  isVerified: Boolean (défaut: false)
  createdAt: Date (automatique)
  updatedAt: Date (automatique)
}
```

**Caractéristiques :**
- ✅ **Index unique composite** sur `(clientId, garageId)` - Un seul avis par client par garage
- ✅ Système de vérification (`isVerified`) pour les avis basés sur des rendez-vous réels
- ✅ Note de 1 à 5 étoiles
- ✅ Commentaire optionnel

**Relations :**
- `clientId` → `User` (Many-to-One, requis)
- `garageId` → `Garage` (Many-to-One, requis)
- `appointmentId` → `Appointment` (Many-to-One, optionnel)

**Index :**
- `{ clientId: 1, garageId: 1 }` (unique) - Empêche les doublons d'avis

**Impact sur les garages :**
- Les notes sont utilisées pour calculer `Garage.rating.average` et `Garage.rating.count`

---

### 6. Collection `favorites`

**Description :** Garages marqués comme favoris par les clients

**Schéma :**
```javascript
{
  clientId: ObjectId (requis, référence User)
  garageId: ObjectId (requis, référence Garage)
  createdAt: Date (automatique)
  updatedAt: Date (automatique)
}
```

**Caractéristiques :**
- ✅ **Index unique composite** sur `(clientId, garageId)` - Un garage ne peut être en favori qu'une fois par client
- ✅ Structure simple et efficace

**Relations :**
- `clientId` → `User` (Many-to-One, requis)
- `garageId` → `Garage` (Many-to-One, requis)

**Index :**
- `{ clientId: 1, garageId: 1 }` (unique) - Empêche les doublons de favoris

---

### 7. Collection `messages`

**Description :** Messages échangés entre utilisateurs (clients et garagistes)

**Schéma :**
```javascript
{
  senderId: ObjectId (requis, référence User)
  receiverId: ObjectId (requis, référence User)
  appointmentId: ObjectId (optionnel, référence Appointment)
  content: String (requis, trim)
  isRead: Boolean (défaut: false)
  attachments: [String] (URLs Cloudinary)
  createdAt: Date (automatique)
  updatedAt: Date (automatique)
}
```

**Caractéristiques :**
- ✅ Support de pièces jointes (images via Cloudinary)
- ✅ Système de lecture (`isRead`)
- ✅ Possibilité de lier un message à un rendez-vous
- ✅ **Index optimisés** pour les requêtes de conversation

**Relations :**
- `senderId` → `User` (Many-to-One, requis)
- `receiverId` → `User` (Many-to-One, requis)
- `appointmentId` → `Appointment` (Many-to-One, optionnel)

**Index :**
- `{ senderId: 1, receiverId: 1, createdAt: -1 }` - Optimise les requêtes de conversation triées par date
- `{ appointmentId: 1 }` - Optimise les requêtes de messages liés à un rendez-vous

**Intégration Socket.io :**
- Les messages sont également gérés en temps réel via Socket.io (voir `server.js`)

---

## Relations Entre Collections

### Diagramme des Relations

```
User (1) ──< (N) Garage
  │              │
  │              │
  │              └──< (N) Service
  │
  ├──< (N) Appointment ──> (1) Garage
  │                        └──> (1) Service
  │
  ├──< (N) Review ──> (1) Garage
  │                  └──> (0..1) Appointment
  │
  ├──< (N) Favorite ──> (1) Garage
  │
  └──< (N) Message ──> (1) User (receiver)
                       └──> (0..1) Appointment
```

### Relations Détaillées

1. **User ↔ Garage**
   - Un User (garagiste) peut posséder un Garage (via `User.garageId`)
   - Un Garage appartient à un User (via `Garage.ownerId`)
   - Relation bidirectionnelle One-to-One

2. **Garage → Service**
   - Un Garage peut proposer plusieurs Services
   - Un Service appartient à un seul Garage
   - Relation One-to-Many

3. **User → Appointment**
   - Un User (client) peut avoir plusieurs Appointments
   - Un Appointment appartient à un seul User (client)
   - Relation One-to-Many

4. **Garage → Appointment**
   - Un Garage peut recevoir plusieurs Appointments
   - Un Appointment est associé à un seul Garage
   - Relation One-to-Many

5. **Service → Appointment**
   - Un Service peut être réservé dans plusieurs Appointments
   - Un Appointment concerne un seul Service
   - Relation One-to-Many

6. **User → Review**
   - Un User (client) peut laisser plusieurs Reviews
   - Un Review appartient à un seul User (client)
   - Relation One-to-Many (avec contrainte unique par garage)

7. **Garage → Review**
   - Un Garage peut recevoir plusieurs Reviews
   - Un Review concerne un seul Garage
   - Relation One-to-Many

8. **User → Favorite**
   - Un User (client) peut avoir plusieurs Favorites
   - Un Favorite appartient à un seul User (client)
   - Relation One-to-Many (avec contrainte unique par garage)

9. **Garage → Favorite**
   - Un Garage peut être favori de plusieurs Users
   - Un Favorite concerne un seul Garage
   - Relation One-to-Many

10. **User → Message (sender/receiver)**
    - Un User peut envoyer plusieurs Messages
    - Un User peut recevoir plusieurs Messages
    - Relation Many-to-Many via deux références

---

## Index et Performances

### Index Définis

1. **Garage**
   - `location: '2dsphere'` - Recherches géospatiales (proximité)

2. **Review**
   - `{ clientId: 1, garageId: 1 }` (unique) - Un seul avis par client/garage

3. **Favorite**
   - `{ clientId: 1, garageId: 1 }` (unique) - Un seul favori par client/garage

4. **Message**
   - `{ senderId: 1, receiverId: 1, createdAt: -1 }` - Optimisation des conversations
   - `{ appointmentId: 1 }` - Recherche de messages par rendez-vous

5. **User**
   - `email` (unique) - Index automatique créé par Mongoose pour les champs `unique: true`

### Recommandations d'Index Supplémentaires

Pour améliorer les performances, considérer d'ajouter :

1. **Appointment**
   - `{ garageId: 1, date: 1, status: 1 }` - Recherche de rendez-vous par garage et date
   - `{ clientId: 1, status: 1 }` - Rendez-vous d'un client par statut
   - `{ date: 1, status: 1 }` - Rendez-vous à venir

2. **Service**
   - `{ garageId: 1, category: 1, isActive: 1 }` - Services par garage et catégorie
   - `{ category: 1 }` - Recherche par catégorie

3. **Review**
   - `{ garageId: 1, createdAt: -1 }` - Avis récents d'un garage
   - `{ rating: 1 }` - Tri par note

4. **Garage**
   - `{ isVerified: 1, isActive: 1 }` - Garages actifs et vérifiés
   - `{ 'rating.average': -1 }` - Tri par note moyenne

---

## Sécurité et Validation

### Sécurité

1. **Mots de passe**
   - Hashage avec bcrypt (10 rounds)
   - Minimum 6 caractères
   - Non retourné par défaut (`select: false`)

2. **Validation des emails**
   - Format validé par regex
   - Unicité garantie
   - Conversion en lowercase

3. **Validation des données**
   - Champs requis définis
   - Enums pour les valeurs limitées
   - Min/Max pour les nombres

### Contraintes d'Intégrité

1. **Unicité**
   - Email unique par User
   - Un seul avis par client/garage (Review)
   - Un seul favori par client/garage (Favorite)

2. **Références**
   - Toutes les références utilisent `ObjectId` de Mongoose
   - Relations définies avec `ref` pour le populate

---

## Fonctionnalités Spéciales

### 1. Géolocalisation
- Support des coordonnées GPS (longitude, latitude)
- Index 2dsphere pour recherches de proximité
- Permet de trouver des garages à proximité d'une position

### 2. Système de Notation
- Notes de 1 à 5 étoiles
- Calcul automatique de la moyenne et du nombre d'avis
- Avis vérifiés basés sur des rendez-vous réels

### 3. Gestion des Paiements
- Intégration Stripe (`paymentIntentId`)
- Suivi du statut de paiement
- Support des remboursements

### 4. Messagerie en Temps Réel
- Support Socket.io pour le chat en temps réel
- Messages persistés en base de données
- Support des pièces jointes

### 5. Gestion des Fichiers
- Intégration Cloudinary pour les images
- Support de multiples images par garage
- Photos de véhicules dans les rendez-vous
- Avatars utilisateurs

### 6. Horaires d'Ouverture
- Gestion détaillée par jour de la semaine
- Possibilité de marquer un jour comme fermé
- Heures d'ouverture et de fermeture

---

## Points d'Attention et Améliorations Possibles

### Points d'Attention

1. **Pas de validation de référence**
   - Les références `ObjectId` ne sont pas validées automatiquement
   - Risque d'insertion de références invalides

2. **Pas de cascade delete**
   - Suppression d'un garage ne supprime pas automatiquement ses services/appointments
   - Nécessite une gestion manuelle

3. **Calcul des notes**
   - `Garage.rating` n'est pas mis à jour automatiquement lors de l'ajout/suppression d'avis
   - Nécessite une logique métier dans les contrôleurs

4. **Pas d'index sur les dates**
   - Les requêtes par date peuvent être lentes sans index appropriés

### Améliorations Suggérées

1. **Middleware de validation de référence**
   - Vérifier l'existence des références avant insertion

2. **Hooks Mongoose**
   - Post-save hook pour mettre à jour `Garage.rating` automatiquement
   - Pre-remove hook pour gérer les suppressions en cascade

3. **Index supplémentaires**
   - Ajouter les index recommandés ci-dessus

4. **Schéma de véhicule séparé**
   - Créer une collection `Vehicle` pour une meilleure gestion
   - Permettrait de suivre l'historique des véhicules

5. **Soft delete**
   - Ajouter un champ `deletedAt` pour les suppressions logiques
   - Permet de conserver l'historique

6. **Versioning**
   - Ajouter un champ `__v` pour le versioning des documents
   - Utile pour la gestion des conflits

---

## Statistiques et Métriques

### Collections et Documents Estimés

- **Users** : ~1000-10000 utilisateurs (clients + garagistes + admins)
- **Garages** : ~100-1000 garages
- **Services** : ~500-5000 services (5-10 par garage en moyenne)
- **Appointments** : ~5000-50000 rendez-vous (croissance continue)
- **Reviews** : ~2000-20000 avis (2-4 par garage en moyenne)
- **Favorites** : ~1000-10000 favoris
- **Messages** : ~10000-100000 messages (croissance continue)

### Taille Estimée

- **Petite instance** : ~100 MB - 1 GB
- **Moyenne instance** : ~1 GB - 10 GB
- **Grande instance** : ~10 GB - 100 GB

---

## Conclusion

La base de données est bien structurée avec :
- ✅ Relations claires et logiques
- ✅ Index appropriés pour les recherches courantes
- ✅ Validation des données
- ✅ Support de fonctionnalités avancées (géolocalisation, paiements, chat)

**Points forts :**
- Architecture modulaire et extensible
- Support des fonctionnalités modernes (géolocalisation, temps réel)
- Sécurité des mots de passe
- Gestion des fichiers via Cloudinary

**Points à améliorer :**
- Ajouter plus d'index pour optimiser les requêtes
- Implémenter la mise à jour automatique des notes
- Ajouter la validation des références
- Considérer un schéma de véhicule séparé

