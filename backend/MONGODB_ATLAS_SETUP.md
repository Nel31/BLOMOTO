# Guide de Configuration MongoDB Atlas

Ce guide vous explique comment configurer MongoDB Atlas pour votre application Promoto.

## 📋 Étapes de Configuration

### 1. Créer un compte MongoDB Atlas

1. Allez sur [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Cliquez sur **"Try Free"** ou **"Sign Up"**
3. Créez un compte (gratuit) ou connectez-vous

### 2. Créer un Cluster

1. Une fois connecté, cliquez sur **"Build a Database"**
2. Choisissez le plan **FREE (M0)** - Gratuit pour toujours
3. Sélectionnez votre région (choisissez la plus proche de vous)
4. Cliquez sur **"Create"**
5. Attendez 1-3 minutes que le cluster soit créé

### 3. Créer un Utilisateur de Base de Données

1. Dans la section **"Security"** → **"Database Access"**
2. Cliquez sur **"Add New Database User"**
3. Choisissez **"Password"** comme méthode d'authentification
4. Entrez un nom d'utilisateur (ex: `promoto-admin`)
5. Générez un mot de passe sécurisé (ou créez-en un)
6. **⚠️ IMPORTANT :** Sauvegardez le nom d'utilisateur et le mot de passe !
7. Rôle : Sélectionnez **"Atlas admin"** ou **"Read and write to any database"**
8. Cliquez sur **"Add User"**

### 4. Configurer l'Accès Réseau (Whitelist)

1. Dans la section **"Security"** → **"Network Access"**
2. Cliquez sur **"Add IP Address"**
3. Pour le développement, cliquez sur **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ Pour la production, ajoutez uniquement les IPs de vos serveurs
4. Cliquez sur **"Confirm"**

### 5. Obtenir l'URI de Connexion

1. Retournez à **"Database"** → Cliquez sur **"Connect"** sur votre cluster
2. Sélectionnez **"Connect your application"**
3. Choisissez **"Node.js"** comme driver
4. Version : **4.1 or later**
5. Copiez l'URI qui ressemble à :
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Configurer le Fichier .env

1. Ouvrez le fichier `.env` dans `/home/seneque/BLOMOTO/backend/.env`
2. Remplacez la ligne `MONGODB_URI` avec votre URI copiée
3. **Remplacez** `<username>` et `<password>` par vos identifiants créés à l'étape 3
4. **Ajoutez** le nom de la base de données à la fin de l'URI :
   ```
   mongodb+srv://promoto-admin:VotreMotDePasse@cluster0.xxxxx.mongodb.net/promoto?retryWrites=true&w=majority
   ```
   Note : Le nom de la base (`promoto`) est ajouté avant le `?`

### 7. Exemple d'URI Finale

Votre URI finale devrait ressembler à ceci :
```
MONGODB_URI=mongodb+srv://promoto-admin:MonMotDePasse123@cluster0.abc123.mongodb.net/promoto?retryWrites=true&w=majority
```

## ✅ Vérification

1. Assurez-vous que votre fichier `.env` contient la bonne URI
2. Démarrez votre serveur backend :
   ```bash
   cd /home/seneque/BLOMOTO/backend
   npm start
   # ou
   npm run dev
   ```
3. Vous devriez voir : `✅ Connexion à MongoDB réussie`

## 🔒 Sécurité

### Pour la Production

1. **Ne partagez jamais** votre fichier `.env`
2. Le fichier `.env` est déjà dans `.gitignore` (ne sera pas commité)
3. Utilisez des variables d'environnement sur votre serveur de production
4. Limitez l'accès réseau aux IPs de vos serveurs uniquement
5. Utilisez un mot de passe fort pour l'utilisateur de base de données
6. Activez l'authentification à deux facteurs sur votre compte Atlas

### Génération d'un JWT_SECRET Sécurisé

Pour générer un JWT_SECRET sécurisé, utilisez :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📊 Monitoring

MongoDB Atlas offre un dashboard pour :
- Surveiller les performances
- Voir les métriques de votre cluster
- Gérer les sauvegardes
- Configurer les alertes

## 🆘 Dépannage

### Erreur : "Authentication failed"
- Vérifiez que le nom d'utilisateur et le mot de passe sont corrects
- Assurez-vous que l'utilisateur a les bonnes permissions

### Erreur : "IP not whitelisted"
- Vérifiez que votre IP est dans la whitelist (Network Access)
- Pour le développement, utilisez 0.0.0.0/0 (toutes les IPs)

### Erreur : "Connection timeout"
- Vérifiez votre connexion internet
- Vérifiez que le cluster est actif dans le dashboard Atlas
- Vérifiez que le firewall ne bloque pas la connexion

### Erreur : "Database name not found"
- MongoDB Atlas crée automatiquement la base de données au premier accès
- Assurez-vous que le nom dans l'URI correspond à ce que vous voulez

## 📚 Ressources

- [Documentation MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Guide de connexion Node.js](https://docs.atlas.mongodb.com/driver-connection/)
- [Support MongoDB Atlas](https://www.mongodb.com/support)

## 💡 Astuces

1. **Cluster gratuit (M0)** : 
   - 512 MB de stockage
   - Parfait pour le développement et les petits projets
   - Pas de limite de temps

2. **Nom de la base de données** :
   - Le nom `promoto` sera créé automatiquement au premier accès
   - Vous pouvez le changer dans l'URI si vous préférez un autre nom

3. **Performance** :
   - Le cluster gratuit peut être un peu lent au démarrage
   - Les opérations peuvent prendre quelques secondes la première fois
   - C'est normal pour un cluster gratuit

4. **Sauvegardes** :
   - Le plan gratuit n'inclut pas de sauvegardes automatiques
   - Pensez à exporter vos données régulièrement pour le développement

