# Guide de Configuration - Promoto

Ce guide explique comment configurer toutes les fonctionnalités avancées de l'application Promoto.

## 📋 Table des matières

1. [Configuration de base](#1-configuration-de-base)
2. [Cloudinary (Upload d'images)](#2-cloudinary-upload-dimages)
3. [Email (SMTP)](#3-email-smtp)
4. [SMS (Twilio - Optionnel)](#4-sms-twilio-optionnel)
5. [Paiement Stripe (Optionnel)](#5-paiement-stripe-optionnel)
6. [Socket.io (Chat en temps réel)](#6-socketio-chat-en-temps-réel)

---

## 1. Configuration de base

### Backend (.env)

Créez un fichier `.env` dans le dossier `backend/` avec les variables suivantes :

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/promoto

# JWT - Changez cette clé en production !
JWT_SECRET=votre_secret_jwt_ici_changez_en_production

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Notifications
ENABLE_REMINDERS=true

# Server
PORT=5000
NODE_ENV=development
```

---

## 2. Cloudinary (Upload d'images)

Cloudinary permet de stocker et gérer les images (garages, véhicules, avatars) de manière optimale.

### Étapes de configuration

1. **Créer un compte Cloudinary**
   - Allez sur https://cloudinary.com
   - Créez un compte gratuit (gratuit jusqu'à 25GB)
   - Connectez-vous à votre dashboard

2. **Récupérer vos identifiants**
   - Dans le dashboard Cloudinary, allez dans **Settings** → **Security**
   - Vous trouverez :
     - `Cloud Name` : le nom de votre cloud
     - `API Key` : votre clé API
     - `API Secret` : votre secret API (⚠️ gardez-le secret !)

3. **Ajouter dans backend/.env**

```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### Utilisation

Une fois configuré, les uploads fonctionnent automatiquement :
- **Garages** : `/api/upload/garage` (max 10 images)
- **Véhicules** : `/api/upload/vehicle` (max 5 photos)
- **Avatars** : `/api/upload/avatar` (1 image)

Les images sont automatiquement optimisées et redimensionnées par Cloudinary.

---

## 3. Email (SMTP)

Le service email permet d'envoyer :
- Confirmations de rendez-vous
- Rappels de rendez-vous
- Notifications aux garagistes

### Option 1 : Gmail (Recommandé pour débuter)

1. **Activer l'authentification à deux facteurs** sur votre compte Gmail
2. **Générer un mot de passe d'application** :
   - Allez dans https://myaccount.google.com/security
   - Activez la validation en 2 étapes si ce n'est pas fait
   - Allez dans "Mots de passe des applications"
   - Créez un mot de passe pour "Mail"
   - Copiez le mot de passe généré (16 caractères)

3. **Ajouter dans backend/.env**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
```

### Option 2 : Autres fournisseurs SMTP

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre_api_key_sendgrid
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@votre_domaine.mailgun.org
SMTP_PASS=votre_mot_de_passe_mailgun
```

#### OVH / Hostinger / Autres
```env
SMTP_HOST=smtp.votre_hebergeur.com
SMTP_PORT=587
SMTP_USER=votre_email@votre_domaine.com
SMTP_PASS=votre_mot_de_passe_email
```

### Test

Pour tester, créez un rendez-vous. Un email de confirmation sera automatiquement envoyé.

---

## 4. SMS (Twilio - Optionnel)

Les SMS permettent d'envoyer des rappels de rendez-vous par SMS.

### Configuration Twilio

1. **Créer un compte Twilio**
   - Allez sur https://www.twilio.com
   - Créez un compte (gratuit avec crédit de test)
   - Validez votre numéro de téléphone

2. **Récupérer vos identifiants**
   - Dans le dashboard Twilio :
     - `Account SID` : trouvable sur la page d'accueil
     - `Auth Token` : trouvable sur la page d'accueil (cliquez sur "view" pour le voir)
     - `Phone Number` : votre numéro Twilio (format: +33612345678)

3. **Ajouter dans backend/.env**

```env
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=+33612345678
```

### Note

- En mode test, Twilio ne peut envoyer des SMS qu'aux numéros vérifiés
- Pour la production, vous devez vérifier votre compte et payer les crédits

---

## 5. Paiement Stripe (Optionnel)

Stripe permet d'accepter les paiements en ligne pour les services.

### Configuration Stripe

1. **Créer un compte Stripe**
   - Allez sur https://stripe.com
   - Créez un compte
   - Complétez votre profil (en mode test pour débuter)

2. **Récupérer vos clés API**
   - Dans le dashboard Stripe, allez dans **Developers** → **API keys**
   - **Mode Test** (pour développement) :
     - `Publishable key` : commence par `pk_test_...`
     - `Secret key` : commence par `sk_test_...`
   - **Mode Live** (pour production) :
     - `Publishable key` : commence par `pk_live_...`
     - `Secret key` : commence par `sk_live_...`

3. **Backend - Ajouter dans backend/.env**

```env
STRIPE_SECRET_KEY=sk_test_votre_clé_secrète
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook
```

4. **Frontend - Créer un fichier `.env` dans `web/`**

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_clé_publique
VITE_API_BASE_URL=http://localhost:5000/api
```

### Configuration du Webhook Stripe

1. Dans le dashboard Stripe, allez dans **Developers** → **Webhooks**
2. Cliquez sur **Add endpoint**
3. URL : `https://votre-domaine.com/api/payments/webhook`
4. Événements à écouter : `payment_intent.succeeded`
5. Copiez le **Signing secret** (commence par `whsec_`) dans `STRIPE_WEBHOOK_SECRET`

### Test avec Stripe

Stripe fournit des numéros de carte de test :
- **Carte valide** : `4242 4242 4242 4242`
- **Date** : n'importe quelle date future
- **CVC** : n'importe quel 3 chiffres
- **Code postal** : n'importe quel code postal

---

## 6. Socket.io (Chat en temps réel)

Socket.io est déjà configuré automatiquement. Assurez-vous juste que :

1. **Backend/.env**
```env
FRONTEND_URL=http://localhost:5173
```
(Mettez l'URL de votre frontend en production)

2. Le backend doit démarrer avec `server.listen()` (déjà fait)

3. Le frontend se connecte automatiquement via `socketService`

### En production

Si vous déployez sur différents domaines :
```env
FRONTEND_URL=https://votre-frontend.com
```

---

## 🔒 Sécurité en production

### Backend (.env)

- ✅ Changez `JWT_SECRET` en production (générez une clé aléatoire forte)
- ✅ Utilisez `NODE_ENV=production`
- ✅ Ne commitez JAMAIS le fichier `.env` (il est dans `.gitignore`)
- ✅ Utilisez des variables d'environnement de votre hébergeur

### Frontend (.env)

- ✅ Le fichier `.env` peut être commité (les clés publiques sont sécurisées)
- ⚠️ `VITE_STRIPE_PUBLISHABLE_KEY` est publique par design (c'est normal)

### Recommandations

1. **Hébergez votre backend** sur :
   - Heroku
   - Railway
   - DigitalOcean
   - AWS
   - VPS

2. **Hébergez votre frontend** sur :
   - Vercel
   - Netlify
   - Cloudflare Pages

3. **Base de données MongoDB** :
   - MongoDB Atlas (gratuit jusqu'à 512MB)

---

## 📝 Checklist de configuration

### Obligatoire

- [ ] MongoDB configuré (`MONGODB_URI`)
- [ ] JWT_SECRET changé en production
- [ ] Cloudinary configuré (pour les images)
- [ ] SMTP configuré (pour les emails)

### Optionnel mais recommandé

- [ ] Twilio configuré (pour SMS)
- [ ] Stripe configuré (pour paiement)
- [ ] Variables d'environnement configurées en production

---

## 🧪 Tester la configuration

### Test Cloudinary

1. Allez dans "Paramètres du garage" (pour garagiste)
2. Essayez d'uploader une image
3. Si ça fonctionne, l'image apparaîtra après upload

### Test Email

1. Créez un compte client
2. Réservez un rendez-vous
3. Vérifiez votre boîte email (et spam)

### Test SMS

1. Ajoutez un numéro de téléphone à votre profil
2. Créez un rendez-vous
3. Vérifiez votre téléphone (en mode test, seul votre numéro vérifié fonctionne)

### Test Stripe

1. Réservez un rendez-vous avec un service payant
2. Utilisez la carte de test : `4242 4242 4242 4242`
3. Vérifiez que le paiement passe

### Test Chat

1. Connectez-vous en tant que client
2. Allez dans "Messages"
3. Commencez une conversation avec un garagiste

---

## ❓ Problèmes courants

### Images ne s'uploadent pas
- Vérifiez vos clés Cloudinary dans `.env`
- Vérifiez que le dossier `uploads/` existe (créé automatiquement)

### Emails ne partent pas
- Vérifiez vos identifiants SMTP
- Pour Gmail, utilisez un "mot de passe d'application", pas votre mot de passe normal
- Vérifiez les logs du serveur

### SMS ne partent pas
- En mode test Twilio, seul votre numéro vérifié fonctionne
- Vérifiez que le format du numéro est correct (+336...)

### Paiement ne fonctionne pas
- Vérifiez que `VITE_STRIPE_PUBLISHABLE_KEY` est dans le `.env` du frontend
- Vérifiez que `STRIPE_SECRET_KEY` est dans le `.env` du backend
- Utilisez les cartes de test Stripe

### Chat ne fonctionne pas
- Vérifiez que `FRONTEND_URL` correspond à l'URL de votre frontend
- Vérifiez les logs du serveur pour les erreurs de connexion Socket.io

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs du serveur (`console.log` dans le terminal)
2. Vérifiez la console du navigateur (F12)
3. Vérifiez que toutes les variables d'environnement sont bien définies

---

**Bonne configuration ! 🚀**

