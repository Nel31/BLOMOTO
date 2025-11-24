# Guide d'Accès à la Base de Données pour l'Équipe

Ce guide explique comment donner accès à la base de données MongoDB Atlas aux membres de votre équipe de manière sécurisée.

## 📋 Table des Matières

1. [Méthodes d'Accès](#méthodes-daccès)
2. [Option 1 : Utilisateur Partagé (Recommandé pour petites équipes)](#option-1--utilisateur-partagé-recommandé-pour-petites-équipes)
3. [Option 2 : Utilisateurs Individuels (Recommandé pour grandes équipes)](#option-2--utilisateurs-individuels-recommandé-pour-grandes-équipes)
4. [Option 3 : Gestionnaire de Secrets (Recommandé pour production)](#option-3--gestionnaire-de-secrets-recommandé-pour-production)
5. [Configuration de l'Accès Réseau](#configuration-de-laccès-réseau)
6. [Partage Sécurisé des Credentials](#partage-sécurisé-des-credentials)
7. [Configuration Locale pour l'Équipe](#configuration-locale-pour-léquipe)

---

## Méthodes d'Accès

Il existe plusieurs façons de donner accès à MongoDB Atlas à votre équipe :

1. **Utilisateur partagé** - Un seul utilisateur DB partagé par toute l'équipe
2. **Utilisateurs individuels** - Un utilisateur DB par membre de l'équipe
3. **Gestionnaire de secrets** - Utilisation d'un service comme 1Password, Bitwarden, etc.

---

## Option 1 : Utilisateur Partagé (Recommandé pour petites équipes)

### ✅ Avantages
- Simple à configurer
- Un seul mot de passe à gérer
- Idéal pour les équipes de 2-5 personnes

### ⚠️ Inconvénients
- Pas de traçabilité individuelle
- Si le mot de passe est compromis, tout le monde est affecté
- Difficile de révoquer l'accès d'une seule personne

### Étapes de Configuration

#### 1. Créer un Utilisateur Partagé dans MongoDB Atlas

1. Connectez-vous à [MongoDB Atlas](https://cloud.mongodb.com/)
2. Allez dans **Security** → **Database Access**
3. Cliquez sur **"Add New Database User"**
4. Configurez l'utilisateur :
   - **Authentication Method** : Password
   - **Username** : `promoto-team` (ou un nom de votre choix)
   - **Password** : Générez un mot de passe fort (ou créez-en un)
   - **Database User Privileges** : Sélectionnez **"Atlas admin"** ou **"Read and write to any database"**
5. Cliquez sur **"Add User"**
6. **⚠️ IMPORTANT** : Sauvegardez le mot de passe dans un gestionnaire de secrets

#### 2. Partager l'URI avec l'Équipe

L'URI de connexion sera :
```
mongodb+srv://promoto-team:VOTRE_MOT_DE_PASSE@cluster0.ua3qcv1.mongodb.net/promoto?retryWrites=true&w=majority
```

**⚠️ Ne partagez JAMAIS cette URI par email ou chat non sécurisé !**

#### 3. Mettre à Jour le .env.example

Mettez à jour le fichier `.env.example` pour que l'équipe sache quel format utiliser :

```env
# Base de données MongoDB Atlas
# Demandez l'URI complète au responsable technique
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/promoto?retryWrites=true&w=majority
```

---

## Option 2 : Utilisateurs Individuels (Recommandé pour grandes équipes)

### ✅ Avantages
- Traçabilité individuelle (chaque action est liée à un utilisateur)
- Révoquer l'accès d'une personne sans affecter les autres
- Meilleure sécurité
- Conformité avec les politiques de sécurité d'entreprise

### ⚠️ Inconvénients
- Plus de travail de configuration
- Plus d'utilisateurs à gérer

### Étapes de Configuration

#### 1. Créer un Utilisateur pour Chaque Membre

Pour chaque membre de l'équipe :

1. Allez dans **Security** → **Database Access**
2. Cliquez sur **"Add New Database User"**
3. Configurez l'utilisateur :
   - **Username** : `promoto-[nom-du-membre]` (ex: `promoto-john`, `promoto-marie`)
   - **Password** : Générez un mot de passe fort unique
   - **Database User Privileges** : **"Read and write to any database"**
4. Cliquez sur **"Add User"**
5. Partagez les credentials individuellement avec chaque membre

#### 2. Template d'URI pour Chaque Membre

Chaque membre aura une URI unique :
```
mongodb+srv://promoto-john:SON_MOT_DE_PASSE@cluster0.ua3qcv1.mongodb.net/promoto?retryWrites=true&w=majority
```

#### 3. Gestion des Utilisateurs

**Ajouter un nouveau membre :**
1. Créez un nouvel utilisateur dans Atlas
2. Partagez les credentials de manière sécurisée
3. Le membre configure son `.env` local

**Révoquer l'accès d'un membre :**
1. Allez dans **Database Access**
2. Trouvez l'utilisateur concerné
3. Cliquez sur **"Delete"** ou **"Edit"** → Désactivez l'utilisateur

---

## Option 3 : Gestionnaire de Secrets (Recommandé pour production)

### Services Recommandés

- **1Password** (payant, très sécurisé)
- **Bitwarden** (gratuit, open-source)
- **LastPass** (freemium)
- **AWS Secrets Manager** (pour AWS)
- **HashiCorp Vault** (pour infrastructure)

### Configuration avec 1Password/Bitwarden

1. **Créer un "Vault" partagé** pour l'équipe
2. **Ajouter une entrée "MongoDB Atlas"** avec :
   - **URI complète** : `mongodb+srv://...`
   - **Username** : `promoto-team`
   - **Password** : (stocké de manière sécurisée)
   - **Cluster** : `cluster0.ua3qcv1.mongodb.net`
   - **Database** : `promoto`
3. **Partager le vault** avec les membres de l'équipe
4. Chaque membre **copie l'URI** dans son `.env` local

### Avantages

- ✅ Pas de partage de credentials par email/chat
- ✅ Historique des accès
- ✅ Rotation automatique des mots de passe
- ✅ Révoquer l'accès facilement
- ✅ Conformité avec les politiques de sécurité

---

## Configuration de l'Accès Réseau

### Pour le Développement Local

1. Allez dans **Security** → **Network Access**
2. Cliquez sur **"Add IP Address"**
3. Pour permettre l'accès depuis n'importe où (développement uniquement) :
   - Cliquez sur **"Allow Access from Anywhere"**
   - IP Address : `0.0.0.0/0`
   - Comment : "Développement - Accès équipe"
4. Cliquez sur **"Confirm"**

⚠️ **ATTENTION** : `0.0.0.0/0` permet l'accès depuis n'importe quelle IP. Utilisez uniquement pour le développement !

### Pour la Production

1. **Obtenez les IPs publiques** de chaque membre de l'équipe
2. **Ajoutez chaque IP individuellement** :
   - IP Address : `123.456.789.0/32` (IP spécifique)
   - Comment : "John Doe - Développement"
3. Répétez pour chaque membre

### Comment Trouver Votre IP Publique

```bash
# Sur Linux/Mac
curl ifconfig.me

# Ou
curl ipinfo.io/ip

# Sur Windows (PowerShell)
Invoke-RestMethod -Uri "https://api.ipify.org"
```

### IP Dynamique (Recommandé)

Si les membres de l'équipe ont des IPs qui changent :

1. Utilisez **MongoDB Atlas IP Access List API**
2. Créez un script qui met à jour automatiquement l'IP
3. Ou utilisez un VPN avec IP fixe

---

## Partage Sécurisé des Credentials

### ❌ À NE JAMAIS FAIRE

- ❌ Envoyer par email non chiffré
- ❌ Partager sur Slack/Teams/Discord (même en message privé)
- ❌ Commiter dans Git (même dans un commit privé)
- ❌ Partager par SMS
- ❌ Écrire sur un post-it ou document non sécurisé

### ✅ Méthodes Sécurisées

1. **Gestionnaire de secrets** (1Password, Bitwarden) - **RECOMMANDÉ**
2. **Chiffrement PGP** - Envoyer par email chiffré
3. **Signal/WhatsApp** - Message chiffré de bout en bout (acceptable pour développement)
4. **Réunion en personne** - Pour la première configuration
5. **Partage d'écran sécurisé** - Via Zoom/Teams avec chiffrement

### Template de Message Sécurisé

```
Bonjour [Nom],

Voici tes credentials MongoDB Atlas pour le projet Promoto :

URI: mongodb+srv://promoto-[ton-nom]:[MOT_DE_PASSE]@cluster0.ua3qcv1.mongodb.net/promoto?retryWrites=true&w=majority

Instructions:
1. Crée un fichier .env dans backend/
2. Ajoute la ligne MONGODB_URI avec l'URI ci-dessus
3. Remplace [MOT_DE_PASSE] par le mot de passe que je t'ai donné en privé

⚠️ Ne partage jamais ces credentials publiquement.

Merci,
[Votre nom]
```

---

## Configuration Locale pour l'Équipe

### Checklist pour Nouveaux Membres

Quand un nouveau membre rejoint l'équipe :

- [ ] 1. Cloner le repository
  ```bash
  git clone <url-du-repo>
  cd BLOMOTO/backend
  ```

- [ ] 2. Installer les dépendances
  ```bash
  npm install
  ```

- [ ] 3. Créer le fichier `.env`
  ```bash
  cp .env.example .env
  ```

- [ ] 4. Obtenir l'URI MongoDB Atlas
  - Via gestionnaire de secrets, ou
  - Demander au responsable technique

- [ ] 5. Configurer le `.env`
  ```env
  MONGODB_URI=mongodb+srv://username:password@cluster0.ua3qcv1.mongodb.net/promoto?retryWrites=true&w=majority
  ```

- [ ] 6. Tester la connexion
  ```bash
  npm start
  # Devrait afficher: ✅ Connexion à MongoDB réussie
  ```

### Mettre à Jour .env.example

Assurez-vous que `.env.example` contient toutes les variables nécessaires :

```env
# Configuration du serveur
PORT=5000
NODE_ENV=development

# Base de données MongoDB Atlas
# Demandez l'URI complète au responsable technique ou consultez le gestionnaire de secrets
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/promoto?retryWrites=true&w=majority

# JWT Secret
# Générez une clé secrète aléatoire pour la production
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
```

---

## Gestion des Accès

### Ajouter un Nouveau Membre

1. **Créer l'utilisateur dans Atlas** (si Option 2)
2. **Ajouter son IP** dans Network Access (si nécessaire)
3. **Partager les credentials** de manière sécurisée
4. **Vérifier** qu'il peut se connecter

### Révoquer l'Accès d'un Membre

1. **Désactiver l'utilisateur** dans Database Access
   - Ou le supprimer complètement
2. **Retirer son IP** de Network Access (si ajoutée individuellement)
3. **Révoquer l'accès** au gestionnaire de secrets (si utilisé)
4. **Changer le mot de passe** si utilisateur partagé (Option 1)

### Rotation des Mots de Passe

**Recommandation** : Changer les mots de passe tous les 3-6 mois

1. **Créer un nouveau mot de passe** dans Atlas
2. **Mettre à jour l'URI** dans le gestionnaire de secrets
3. **Notifier l'équipe** (via canal sécurisé)
4. **Chaque membre met à jour** son `.env` local

---

## Bonnes Pratiques

### ✅ À Faire

- ✅ Utiliser un gestionnaire de secrets
- ✅ Limiter l'accès réseau aux IPs nécessaires
- ✅ Utiliser des mots de passe forts (min 16 caractères)
- ✅ Activer l'authentification à deux facteurs sur le compte Atlas
- ✅ Documenter qui a accès et pourquoi
- ✅ Révoquer l'accès des membres qui quittent l'équipe
- ✅ Utiliser des utilisateurs individuels pour la production

### ❌ À Éviter

- ❌ Partager les credentials par email/chat non sécurisé
- ❌ Utiliser le même mot de passe pour plusieurs services
- ❌ Commiter le fichier `.env` dans Git
- ❌ Laisser `0.0.0.0/0` en production
- ❌ Partager les credentials avec des personnes non autorisées
- ❌ Utiliser des mots de passe faibles

---

## Dépannage

### Erreur : "Authentication failed"

**Causes possibles :**
- Mot de passe incorrect
- Nom d'utilisateur incorrect
- Utilisateur désactivé dans Atlas

**Solution :**
1. Vérifier les credentials dans Atlas
2. Vérifier le fichier `.env` local
3. Demander au responsable de vérifier l'utilisateur

### Erreur : "IP not whitelisted"

**Causes possibles :**
- Votre IP n'est pas dans la whitelist
- Votre IP a changé (IP dynamique)

**Solution :**
1. Trouver votre IP publique : `curl ifconfig.me`
2. Demander au responsable d'ajouter votre IP
3. Ou utiliser `0.0.0.0/0` pour le développement (non recommandé en production)

### Erreur : "Connection timeout"

**Causes possibles :**
- Problème de connexion internet
- Firewall bloque la connexion
- Cluster Atlas en maintenance

**Solution :**
1. Vérifier votre connexion internet
2. Vérifier le statut du cluster dans Atlas
3. Vérifier que le firewall n'bloque pas MongoDB (port 27017)

---

## Checklist de Configuration pour l'Équipe

### Pour le Responsable Technique

- [ ] Créer les utilisateurs de base de données dans Atlas
- [ ] Configurer l'accès réseau (whitelist)
- [ ] Partager les credentials de manière sécurisée
- [ ] Mettre à jour `.env.example` si nécessaire
- [ ] Documenter la méthode d'accès choisie
- [ ] Configurer un gestionnaire de secrets (recommandé)

### Pour Chaque Membre de l'Équipe

- [ ] Cloner le repository
- [ ] Installer les dépendances (`npm install`)
- [ ] Créer le fichier `.env` depuis `.env.example`
- [ ] Obtenir l'URI MongoDB Atlas
- [ ] Configurer `MONGODB_URI` dans `.env`
- [ ] Tester la connexion (`npm start`)
- [ ] Vérifier que `.env` est dans `.gitignore`

---

## Ressources

- [Documentation MongoDB Atlas - Database Users](https://docs.atlas.mongodb.com/security-add-mongodb-users/)
- [Documentation MongoDB Atlas - Network Access](https://docs.atlas.mongodb.com/security-add-ip-address/)
- [Guide de Configuration MongoDB Atlas](./MONGODB_ATLAS_SETUP.md)
- [Analyse de la Base de Données](./DATABASE_ANALYSIS.md)

---

## Support

Si vous avez des questions ou des problèmes :
1. Consultez la documentation MongoDB Atlas
2. Contactez le responsable technique de l'équipe
3. Vérifiez les logs du serveur backend
4. Consultez le guide de dépannage ci-dessus

