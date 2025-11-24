# Configuration d'un Utilisateur Partagé MongoDB Atlas

Guide étape par étape pour créer et partager un utilisateur MongoDB Atlas pour votre équipe.

## 📋 Prérequis

- Accès au compte MongoDB Atlas (compte propriétaire ou admin)
- Cluster MongoDB Atlas déjà créé
- Connaissance de l'URI de votre cluster

---

## 🚀 Étapes de Configuration

### Étape 1 : Créer l'Utilisateur dans MongoDB Atlas

1. **Connectez-vous à MongoDB Atlas**
   - Allez sur [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
   - Connectez-vous avec votre compte

2. **Accédez à Database Access**
   - Dans le menu de gauche, cliquez sur **"Security"**
   - Cliquez sur **"Database Access"**

3. **Créer un Nouvel Utilisateur**
   - Cliquez sur le bouton **"Add New Database User"** (en haut à droite)

4. **Configurer l'Utilisateur**
   
   **Méthode d'authentification :**
   - Sélectionnez **"Password"**
   
   **Nom d'utilisateur :**
   - Entrez : `promoto-team` (ou un nom de votre choix)
   - Exemples : `promoto-dev`, `promoto-shared`, `blomoto-team`
   
   **Mot de passe :**
   - **Option A** : Cliquez sur **"Autogenerate Secure Password"** (recommandé)
     - MongoDB générera un mot de passe sécurisé
     - **⚠️ IMPORTANT** : Copiez ce mot de passe immédiatement, vous ne pourrez plus le voir après !
   - **Option B** : Créez votre propre mot de passe
     - Minimum 8 caractères
     - Recommandé : 16+ caractères avec majuscules, minuscules, chiffres et symboles
   
   **Privilèges de l'utilisateur :**
   - Sélectionnez **"Atlas admin"** (accès complet)
     - OU **"Read and write to any database"** (recommandé pour la sécurité)
   
5. **Sauvegarder**
   - Cliquez sur **"Add User"**
   - Attendez la confirmation (quelques secondes)

---

### Étape 2 : Générer un Mot de Passe Sécurisé (si vous créez manuellement)

Si vous préférez créer votre propre mot de passe, utilisez cette commande :

```bash
# Générer un mot de passe sécurisé de 24 caractères
node -e "console.log(require('crypto').randomBytes(12).toString('base64'))"
```

Ou utilisez un générateur en ligne : [https://www.lastpass.com/fr/features/password-generator](https://www.lastpass.com/fr/features/password-generator)

**Exemple de mot de passe généré :** `Kx9#mP2$vL8@nQ5!rT3`

---

### Étape 3 : Obtenir l'URI de Connexion

1. **Retournez au Dashboard**
   - Cliquez sur **"Database"** dans le menu de gauche
   - Cliquez sur **"Connect"** sur votre cluster

2. **Sélectionner "Connect your application"**
   - Choisissez **"Connect your application"**
   - Driver : **"Node.js"**
   - Version : **"4.1 or later"**

3. **Copier l'URI de Base**
   - Vous verrez une URI comme :
     ```
     mongodb+srv://<username>:<password>@cluster0.ua3qcv1.mongodb.net/?retryWrites=true&w=majority
     ```

4. **Construire l'URI Complète**
   - Remplacez `<username>` par : `promoto-team` (ou le nom que vous avez choisi)
   - Remplacez `<password>` par : le mot de passe que vous avez créé
   - Ajoutez `/promoto` avant le `?` pour spécifier le nom de la base de données
   
   **Exemple d'URI finale :**
   ```
   mongodb+srv://promoto-team:Kx9#mP2$vL8@nQ5!rT3@cluster0.ua3qcv1.mongodb.net/promoto?retryWrites=true&w=majority
   ```

   ⚠️ **Note** : Si votre mot de passe contient des caractères spéciaux, vous devez les encoder en URL :
   - `@` devient `%40`
   - `#` devient `%23`
   - `$` devient `%24`
   - `!` devient `%21`
   - etc.

   **Ou utilisez un encodeur URL :** [https://www.urlencoder.org/](https://www.urlencoder.org/)

---

### Étape 4 : Configurer l'Accès Réseau

1. **Accédez à Network Access**
   - Dans le menu de gauche, cliquez sur **"Security"**
   - Cliquez sur **"Network Access"**

2. **Ajouter les IPs de l'Équipe**

   **Option A : Développement (Toutes les IPs)**
   - Cliquez sur **"Add IP Address"**
   - Cliquez sur **"Allow Access from Anywhere"**
   - IP Address : `0.0.0.0/0`
   - Comment : "Développement - Équipe Promoto"
   - Cliquez sur **"Confirm"**
   
   ⚠️ **ATTENTION** : Cette option permet l'accès depuis n'importe quelle IP. Utilisez uniquement pour le développement !

   **Option B : Production (IPs Spécifiques)**
   - Pour chaque membre de l'équipe :
     1. Trouvez leur IP publique : `curl ifconfig.me`
     2. Cliquez sur **"Add IP Address"**
     3. Entrez l'IP : `123.456.789.0/32` (remplacez par l'IP réelle)
     4. Comment : "John Doe - Développement"
     5. Cliquez sur **"Confirm"**

---

### Étape 5 : Tester la Connexion

1. **Créer un fichier de test** (optionnel)

```bash
cd /home/seneque/BLOMOTO/backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connexion à MongoDB réussie !');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  });
"
```

2. **Ou tester avec le serveur**

```bash
cd /home/seneque/BLOMOTO/backend
npm start
```

Vous devriez voir : `✅ Connexion à MongoDB réussie`

---

### Étape 6 : Partager avec l'Équipe

#### Méthode Recommandée : Gestionnaire de Secrets

1. **Créer une entrée dans votre gestionnaire de secrets** (1Password, Bitwarden, etc.)
   - **Titre** : "MongoDB Atlas - Promoto"
   - **URI** : `mongodb+srv://promoto-team:...@cluster0.ua3qcv1.mongodb.net/promoto?retryWrites=true&w=majority`
   - **Username** : `promoto-team`
   - **Password** : (le mot de passe)
   - **Cluster** : `cluster0.ua3qcv1.mongodb.net`
   - **Database** : `promoto`

2. **Partager le vault** avec les membres de l'équipe

#### Méthode Alternative : Partage Sécurisé

Si vous n'utilisez pas de gestionnaire de secrets :

1. **Envoyez un message chiffré** (Signal, WhatsApp)
2. **Ou partagez en personne** lors d'une réunion
3. **Ou utilisez un partage d'écran sécurisé** (Zoom, Teams)

**Template de message :**

```
Bonjour [Nom],

Voici les credentials MongoDB Atlas pour le projet Promoto :

URI complète:
mongodb+srv://promoto-team:[MOT_DE_PASSE]@cluster0.ua3qcv1.mongodb.net/promoto?retryWrites=true&w=majority

Mot de passe: [MOT_DE_PASSE] (je te l'envoie séparément)

Instructions:
1. Crée un fichier .env dans backend/
2. Ajoute la ligne MONGODB_URI avec l'URI ci-dessus
3. Remplace [MOT_DE_PASSE] par le mot de passe que je t'ai donné

⚠️ Ne partage jamais ces credentials publiquement.

Merci,
[Votre nom]
```

---

### Étape 7 : Configuration Locale pour Chaque Membre

Chaque membre de l'équipe doit :

1. **Cloner le repository** (si pas déjà fait)
   ```bash
   git clone <url-du-repo>
   cd BLOMOTO/backend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Créer le fichier .env**
   ```bash
   cp .env.example .env
   ```

4. **Ajouter l'URI MongoDB**
   - Ouvrez `.env`
   - Remplacez la ligne `MONGODB_URI` par l'URI complète partagée

5. **Tester la connexion**
   ```bash
   npm start
   ```

---

## 📝 Checklist de Configuration

### Pour le Responsable Technique

- [ ] Créer l'utilisateur `promoto-team` dans MongoDB Atlas
- [ ] Générer et sauvegarder un mot de passe sécurisé
- [ ] Construire l'URI complète avec le nom d'utilisateur et mot de passe
- [ ] Configurer l'accès réseau (whitelist des IPs ou 0.0.0.0/0 pour dev)
- [ ] Tester la connexion
- [ ] Partager les credentials de manière sécurisée avec l'équipe
- [ ] Documenter l'URI dans un gestionnaire de secrets (recommandé)

### Pour Chaque Membre de l'Équipe

- [ ] Recevoir l'URI MongoDB Atlas
- [ ] Cloner le repository (si pas déjà fait)
- [ ] Installer les dépendances (`npm install`)
- [ ] Créer le fichier `.env` depuis `.env.example`
- [ ] Ajouter l'URI dans `.env`
- [ ] Tester la connexion (`npm start`)
- [ ] Vérifier que `.env` est dans `.gitignore`

---

## 🔒 Sécurité

### Bonnes Pratiques

- ✅ Utiliser un mot de passe fort (16+ caractères)
- ✅ Ne jamais commiter le fichier `.env` dans Git
- ✅ Partager les credentials via un gestionnaire de secrets
- ✅ Limiter l'accès réseau aux IPs nécessaires (en production)
- ✅ Activer l'authentification à deux facteurs sur le compte Atlas
- ✅ Changer le mot de passe tous les 3-6 mois

### À Éviter

- ❌ Partager les credentials par email non chiffré
- ❌ Partager sur Slack/Teams/Discord
- ❌ Utiliser `0.0.0.0/0` en production
- ❌ Utiliser des mots de passe faibles
- ❌ Commiter le fichier `.env` dans Git

---

## 🆘 Dépannage

### Erreur : "Authentication failed"

**Causes possibles :**
- Mot de passe incorrect
- Nom d'utilisateur incorrect
- Caractères spéciaux non encodés dans l'URI

**Solution :**
1. Vérifier le nom d'utilisateur dans Atlas
2. Vérifier le mot de passe (copier-coller peut introduire des espaces)
3. Encoder les caractères spéciaux dans l'URI si nécessaire

### Erreur : "IP not whitelisted"

**Solution :**
1. Trouver votre IP : `curl ifconfig.me`
2. Demander au responsable d'ajouter votre IP dans Network Access
3. Ou utiliser `0.0.0.0/0` pour le développement (non recommandé en production)

### Erreur : "Connection timeout"

**Solution :**
1. Vérifier votre connexion internet
2. Vérifier le statut du cluster dans Atlas
3. Vérifier que le firewall n'bloque pas MongoDB

---

## 📊 Informations à Conserver

Gardez ces informations dans un endroit sécurisé :

- **Nom d'utilisateur** : `promoto-team`
- **Mot de passe** : (dans un gestionnaire de secrets)
- **URI complète** : `mongodb+srv://promoto-team:...@cluster0.ua3qcv1.mongodb.net/promoto?retryWrites=true&w=majority`
- **Cluster** : `cluster0.ua3qcv1.mongodb.net`
- **Base de données** : `promoto`
- **IPs whitelistées** : (liste des IPs autorisées)

---

## 🔄 Rotation du Mot de Passe

Pour changer le mot de passe (recommandé tous les 3-6 mois) :

1. **Créer un nouveau mot de passe** dans Atlas
   - Database Access → Trouver `promoto-team` → Edit → Change Password
2. **Mettre à jour l'URI** dans le gestionnaire de secrets
3. **Notifier l'équipe** (via canal sécurisé)
4. **Chaque membre met à jour** son `.env` local

---

## 📚 Ressources

- [Guide complet d'accès équipe](./TEAM_DATABASE_ACCESS.md)
- [Configuration MongoDB Atlas](./MONGODB_ATLAS_SETUP.md)
- [Documentation MongoDB Atlas](https://docs.atlas.mongodb.com/)

---

## ✅ Vérification Finale

Une fois tout configuré, vérifiez que :

- [ ] L'utilisateur `promoto-team` existe dans Database Access
- [ ] L'accès réseau est configuré (IPs ou 0.0.0.0/0)
- [ ] L'URI de connexion fonctionne (test réussi)
- [ ] Les credentials sont partagés avec l'équipe de manière sécurisée
- [ ] Chaque membre peut se connecter avec succès

**Tout est prêt ! 🎉**

