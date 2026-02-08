# Guide de test des routes de paiement sur Postman

## 📋 Prérequis

1. **Démarrer le serveur backend** :
   ```bash
   cd backend
   npm start
   ```
   Le serveur doit être accessible sur `http://localhost:5000` (ou le port configuré)

2. **Variables d'environnement** :
   - `FEDAPAY_API_KEY` doit être configuré dans `.env`
   - `FRONTEND_URL` doit être configuré (ex: `http://localhost:5173`)

---

## 🔐 Étape 1 : Obtenir un token JWT (Authentification)

### Route : `POST /api/auth/login`

**URL** : `http://localhost:5000/api/auth/login`

**Headers** :
```
Content-Type: application/json
```

**Body** (raw JSON) :
```json
{
  "email": "client@example.com",
  "password": "motdepasse123"
}
```

**Réponse attendue** :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Client Test",
    "email": "client@example.com",
    "role": "client"
  }
}
```

**⚠️ Important** : Copiez le `token` de la réponse, vous en aurez besoin pour les routes protégées.

**💡 Astuce Postman** : Pour éviter de copier-coller le token à chaque fois, ajoutez ce script dans l'onglet "Tests" de votre requête de login :
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
}
```
Ensuite, dans vos autres requêtes, utilisez `{{token}}` dans le header Authorization.

---

## 📋 Étape intermédiaire : Obtenir un appointmentId

Avant de créer un paiement, vous devez avoir un ID de rendez-vous. Voici comment l'obtenir :

### Route : `GET /api/appointments/client/me`

**URL** : `http://localhost:5000/api/appointments/client/me`

**Headers** :
```
Authorization: Bearer VOTRE_TOKEN_JWT_ICI
```

**Réponse** : Liste de tous vos rendez-vous avec leurs IDs
```json
{
  "success": true,
  "count": 2,
  "appointments": [
    {
      "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
      "date": "2024-01-15",
      "status": "pending",
      "paymentStatus": "pending",
      "totalAmount": 5000,
      ...
    }
  ]
}
```

Copiez l'`_id` d'un rendez-vous qui a `paymentStatus: "pending"`.

---

## 💳 Routes FedaPay

### 1. Créer un paiement FedaPay

**Route** : `POST /api/payments/fedapay/create`

**URL** : `http://localhost:5000/api/payments/fedapay/create`

**Headers** :
```
Content-Type: application/json
Authorization: Bearer VOTRE_TOKEN_JWT_ICI
```

**Body** (raw JSON) - Pour un rendez-vous :
```json
{
  "appointmentId": "65a1b2c3d4e5f6a7b8c9d0e1",
  "amount": 5000,
  "currency": "XOF",
  "customerEmail": "client@example.com",
  "customerPhone": "+22912345678",
  "customerName": "Client Test"
}
```

**Body** (raw JSON) - Pour une facture :
```json
{
  "invoiceId": "65a1b2c3d4e5f6a7b8c9d0e2",
  "amount": 10000,
  "currency": "XOF",
  "customerEmail": "client@example.com",
  "customerPhone": "+22912345678",
  "customerName": "Client Test"
}
```

**Réponse attendue** :
```json
{
  "success": true,
  "transactionId": "123456",
  "paymentUrl": "https://pay.fedapay.com/123456",
  "id": 123456,
  "status": "pending",
  ...
}
```

**⚠️ Note** : Utilisez l'`appointmentId` OU l'`invoiceId`, pas les deux en même temps.

---

### 2. Vérifier le statut d'un paiement

**Route** : `GET /api/payments/fedapay/status/:transactionId`

**URL** : `http://localhost:5000/api/payments/fedapay/status/123456`

**Headers** :
```
Authorization: Bearer VOTRE_TOKEN_JWT_ICI
```

**Réponse attendue** :
```json
{
  "success": true,
  "status": "approved",
  "transaction": {
    "id": 123456,
    "status": "approved",
    "amount": 5000,
    "currency": "XOF",
    ...
  }
}
```

---

### 3. Callback FedaPay (Webhook)

**Route** : `POST /api/payments/fedapay/callback`

**URL** : `http://localhost:5000/api/payments/fedapay/callback`

**⚠️ Cette route est publique** (pas besoin d'authentification)

**Headers** :
```
Content-Type: application/json
```

**Body** (raw JSON) - Exemple de callback FedaPay :
```json
{
  "id": 123456,
  "transaction_id": 123456,
  "status": "approved",
  "state": "APPROVED",
  "amount": 5000,
  "metadata": {
    "userId": "65a1b2c3d4e5f6a7b8c9d0e0",
    "referenceId": "65a1b2c3d4e5f6a7b8c9d0e1",
    "referenceType": "appointment"
  }
}
```

**Réponse attendue** :
```json
{
  "received": true,
  "status": "ok",
  "message": "Paiement traité avec succès"
}
```

**💡 Note** : Cette route est généralement appelée automatiquement par FedaPay après un paiement. Pour tester manuellement, vous pouvez simuler l'appel.

---

## 💳 Routes Stripe (optionnel)

### 1. Créer une intention de paiement Stripe

**Route** : `POST /api/payments/stripe/create-intent`

**URL** : `http://localhost:5000/api/payments/stripe/create-intent`

**Headers** :
```
Content-Type: application/json
Authorization: Bearer VOTRE_TOKEN_JWT_ICI
```

**Body** (raw JSON) :
```json
{
  "appointmentId": "65a1b2c3d4e5f6a7b8c9d0e1",
  "amount": 50.00
}
```

**Réponse attendue** :
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

---

### 2. Confirmer un paiement Stripe

**Route** : `POST /api/payments/stripe/confirm`

**URL** : `http://localhost:5000/api/payments/stripe/confirm`

**Headers** :
```
Content-Type: application/json
Authorization: Bearer VOTRE_TOKEN_JWT_ICI
```

**Body** (raw JSON) :
```json
{
  "appointmentId": "65a1b2c3d4e5f6a7b8c9d0e1",
  "paymentIntentId": "pi_xxx"
}
```

---

### 3. Webhook Stripe

**Route** : `POST /api/payments/stripe/webhook`

**URL** : `http://localhost:5000/api/payments/stripe/webhook`

**⚠️ Cette route est publique** (pas besoin d'authentification)

**Headers** :
```
Content-Type: application/json
Stripe-Signature: signature_here
```

**Body** : Format brut (raw) de Stripe

---

## 🔄 Route de compatibilité

### Créer un paiement (redirige vers FedaPay)

**Route** : `POST /api/payments/create-payment`

**URL** : `http://localhost:5000/api/payments/create-payment`

**Headers** :
```
Content-Type: application/json
Authorization: Bearer VOTRE_TOKEN_JWT_ICI
```

**Body** : Identique à `/api/payments/fedapay/create`

---

## 📝 Collection Postman

### Créer une collection Postman

1. **Créer une nouvelle collection** : "BLOMOTO Payments"

2. **Ajouter une variable d'environnement** :
   - Variable : `baseUrl` = `http://localhost:5000`
   - Variable : `token` = (à mettre à jour après login)

3. **Créer les requêtes** :

#### 1. Login
- **Method** : `POST`
- **URL** : `{{baseUrl}}/api/auth/login`
- **Body** : JSON avec email/password
- **Tests** (onglet Tests) :
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
}
```

#### 2. Créer paiement FedaPay
- **Method** : `POST`
- **URL** : `{{baseUrl}}/api/payments/fedapay/create`
- **Headers** : 
  - `Authorization: Bearer {{token}}`
- **Body** : JSON avec appointmentId/invoiceId et amount

#### 3. Vérifier statut
- **Method** : `GET`
- **URL** : `{{baseUrl}}/api/payments/fedapay/status/:transactionId`
- **Headers** : 
  - `Authorization: Bearer {{token}}`

#### 4. Callback FedaPay
- **Method** : `POST`
- **URL** : `{{baseUrl}}/api/payments/fedapay/callback`
- **Body** : JSON avec les données du callback

---

## ✅ Checklist de test

- [ ] Serveur backend démarré
- [ ] Variables d'environnement configurées (FEDAPAY_API_KEY)
- [ ] Token JWT obtenu via `/api/auth/login`
- [ ] Test création paiement FedaPay avec `appointmentId`
- [ ] Test création paiement FedaPay avec `invoiceId`
- [ ] Test vérification statut
- [ ] Test callback (simulation)

---

## 🐛 Erreurs courantes

### 401 Unauthorized
- **Cause** : Token manquant ou invalide
- **Solution** : Vérifier le header `Authorization: Bearer TOKEN`

### 403 Forbidden
- **Cause** : L'utilisateur n'est pas un client ou n'a pas accès à la ressource
- **Solution** : Utiliser un compte avec le rôle `client` et vérifier que l'`appointmentId`/`invoiceId` appartient à l'utilisateur

### 404 Not Found
- **Cause** : `appointmentId` ou `invoiceId` n'existe pas
- **Solution** : Vérifier que l'ID existe dans la base de données

### 500 Internal Server Error
- **Cause** : `FEDAPAY_API_KEY` non configuré ou erreur API FedaPay
- **Solution** : Vérifier le fichier `.env` et les logs du serveur

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier les logs du serveur backend
2. Vérifier que les variables d'environnement sont bien chargées
3. Vérifier que les IDs (appointmentId, invoiceId) existent dans MongoDB
