# 🔹 Intégration KKIAPAY - Guide Complet

Ce guide détaille l'intégration complète du système de paiement KKIAPAY dans l'application BLOMOTO.

---

## 📋 Table des matières

1. [Architecture](#architecture)
2. [Configuration Backend](#configuration-backend)
3. [Configuration Frontend](#configuration-frontend)
4. [Utilisation](#utilisation)
5. [Sécurité](#sécurité)
6. [Flux de paiement](#flux-de-paiement)

---

## 🏗️ Architecture

### Principe de sécurité

✅ **Le frontend ne gère JAMAIS les clés secrètes**
- Le frontend demande au backend de créer une transaction
- Le backend communique avec l'API KKIAPAY
- Le frontend redirige l'utilisateur vers la page de paiement KKIAPAY

### Structure des fichiers

```
backend/
 ├─ controllers/
 │   └─ kkiapayController.js      # Logique métier KKIAPAY
 ├─ routes/
 │   └─ payments.js               # Routes API
 └─ .env                          # Variables d'environnement

web/
 ├─ src/
 │   ├─ services/
 │   │   └─ paymentService.ts     # Service d'appel API
 │   ├─ components/
 │   │   └─ Payment/
 │   │       └─ KkiapayButton.tsx # Composant bouton de paiement
 │   └─ pages/
 │       ├─ PaymentSuccessPage.tsx # Page de succès
 │       └─ PaymentCancelPage.tsx  # Page d'annulation
```

---

## ⚙️ Configuration Backend

### 1. Variables d'environnement

Ajoutez dans `backend/.env` :

```env
# KKIAPAY Configuration
KKIAPAY_SECRET_KEY=votre_secret_key_kkiapay
KKIAPAY_PUBLIC_KEY=votre_public_key_kkiapay
KKIAPAY_API_URL=https://api.kkiapay.me  # Optionnel, par défaut

# Frontend URL (pour les callbacks)
FRONTEND_URL=http://localhost:5173
```

### 2. Routes disponibles

| Route | Méthode | Description | Accès |
|-------|---------|-------------|-------|
| `/api/payments/kkiapay/create` | POST | Créer un paiement | Client (protégé) |
| `/api/payments/kkiapay/status/:transactionId` | GET | Vérifier le statut | Protégé |
| `/api/payments/kkiapay/callback` | POST | Webhook KKIAPAY | Public |

### 3. Fonctionnalités du contrôleur

#### `createKkiapayPayment`
- Crée une transaction KKIAPAY
- Supporte les paiements pour rendez-vous ou factures
- Génère les URLs de callback, return et cancel
- Inclut les métadonnées (userId, referenceId, referenceType)

#### `checkKkiapayStatus`
- Vérifie le statut d'une transaction
- Met à jour automatiquement le rendez-vous/facture si payé

#### `kkiapayCallback`
- **Webhook public** appelé par KKIAPAY après paiement
- **Vérification serveur à serveur** (sécurité)
- Met à jour automatiquement la base de données
- Logging complet pour audit

---

## 🎨 Configuration Frontend

### 1. Service de paiement (`paymentService.ts`)

Le service `paymentService` fournit deux méthodes principales :

```typescript
// Créer un paiement
const paymentData = await paymentService.createPayment({
  appointmentId: '123',
  amount: 5000,
  currency: 'XOF',
});

// Vérifier le statut
const status = await paymentService.checkPaymentStatus(transactionId);
```

### 2. Composant KkiapayButton

```tsx
import KkiapayButton from '../components/Payment/KkiapayButton';

<KkiapayButton
  appointmentId="123"
  amount={5000}
  currency="XOF"
  onSuccess={() => console.log('Paiement initié')}
  onError={(error) => console.error(error)}
  buttonText="Payer maintenant"
/>
```

### 3. Pages de callback

- **`/payment-success`** : Page affichée après un paiement réussi
- **`/payment-cancel`** : Page affichée après une annulation

Ces pages sont automatiquement appelées par KKIAPAY via les URLs `return_url` et `cancel_url`.

---

## 🚀 Utilisation

### Exemple 1 : Paiement d'un rendez-vous

```tsx
import KkiapayButton from '../components/Payment/KkiapayButton';

function AppointmentPayment({ appointmentId, amount }) {
  return (
    <KkiapayButton
      appointmentId={appointmentId}
      amount={amount}
      currency="XOF"
      onSuccess={() => {
        console.log('Redirection vers KKIAPAY...');
      }}
      onError={(error) => {
        alert(`Erreur: ${error}`);
      }}
    />
  );
}
```

### Exemple 2 : Paiement d'une facture

```tsx
<KkiapayButton
  invoiceId={invoiceId}
  amount={invoice.total}
  currency="XOF"
  customerEmail={user.email}
  customerName={user.name}
/>
```

### Exemple 3 : Utilisation directe du service

```typescript
import { paymentService } from '../services/paymentService';

const handlePayment = async () => {
  try {
    const paymentData = await paymentService.createPayment({
      appointmentId: '123',
      amount: 5000,
    });
    
    // Rediriger vers KKIAPAY
    paymentService.redirectToPayment(paymentData.paymentUrl);
  } catch (error) {
    console.error(error);
  }
};
```

---

## 🔒 Sécurité

### Vérification serveur à serveur

⚠️ **IMPORTANT** : Le callback backend effectue toujours une vérification serveur à serveur avant de mettre à jour la base de données.

```javascript
// 1. KKIAPAY appelle le callback avec les données
// 2. Le backend vérifie directement auprès de l'API KKIAPAY
const verifiedTransaction = await verifyPaymentWithKkiapay(transaction_id);

// 3. Seulement si la vérification réussit, on met à jour la DB
if (verifiedTransaction.status === 'SUCCESS') {
  // Mettre à jour la base de données
}
```

### Bonnes pratiques

✅ **À faire :**
- Toujours vérifier le statut via l'API KKIAPAY
- Logger tous les callbacks pour audit
- Répondre rapidement à KKIAPAY (éviter les retries)
- Vérifier les montants (sécurité supplémentaire)

❌ **À éviter :**
- Faire confiance aux données du callback sans vérification
- Exposer les clés secrètes côté frontend
- Ignorer les erreurs de vérification

---

## 🔄 Flux de paiement

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. Clique sur "Payer"
     ▼
┌─────────────────┐
│ Frontend React  │
│ KkiapayButton   │
└────┬────────────┘
     │ 2. POST /api/payments/kkiapay/create
     ▼
┌─────────────────┐
│ Backend Node.js  │
│ kkiapayController│
└────┬────────────┘
     │ 3. POST https://api.kkiapay.me/v1/transactions
     ▼
┌─────────────────┐
│ API KKIAPAY      │
└────┬────────────┘
     │ 4. Retourne paymentUrl
     ▼
┌─────────────────┐
│ Frontend React   │
│ Redirection      │
└────┬────────────┘
     │ 5. window.location.href = paymentUrl
     ▼
┌─────────────────┐
│ Page KKIAPAY     │
│ (Paiement)       │
└────┬────────────┘
     │ 6a. Paiement réussi
     │ 6b. Paiement annulé
     ▼
┌─────────────────┐
│ Callback Backend │
│ (Webhook)        │
└────┬────────────┘
     │ 7. Vérification serveur à serveur
     ▼
┌─────────────────┐
│ API KKIAPAY      │
│ (Vérification)   │
└────┬────────────┘
     │ 8. Confirmation
     ▼
┌─────────────────┐
│ Backend          │
│ Mise à jour DB   │
└────┬────────────┘
     │ 9. Redirection frontend
     ▼
┌─────────────────┐
│ PaymentSuccess   │
│ ou Cancel        │
└─────────────────┘
```

---

## 📝 Exemple complet

### Backend : Création d'un paiement

```javascript
// POST /api/payments/kkiapay/create
{
  "appointmentId": "507f1f77bcf86cd799439011",
  "amount": 5000,
  "currency": "XOF",
  "customerEmail": "client@example.com"
}

// Réponse
{
  "success": true,
  "transactionId": "txn_123456",
  "paymentUrl": "https://pay.kkiapay.me/..."
}
```

### Frontend : Utilisation

```tsx
function PaymentPage() {
  const [appointment] = useState({ _id: '123', totalAmount: 5000 });
  
  return (
    <div>
      <h2>Paiement</h2>
      <KkiapayButton
        appointmentId={appointment._id}
        amount={appointment.totalAmount}
        onSuccess={() => {
          console.log('Redirection vers KKIAPAY...');
        }}
      />
    </div>
  );
}
```

### Callback : Webhook KKIAPAY

```javascript
// POST /api/payments/kkiapay/callback
{
  "transaction_id": "txn_123456",
  "status": "SUCCESS",
  "amount": 5000,
  "metadata": {
    "userId": "507f1f77bcf86cd799439011",
    "referenceId": "507f1f77bcf86cd799439012",
    "referenceType": "appointment"
  }
}
```

---

## 🐛 Dépannage

### Erreur : "KKIAPAY non configuré"
- Vérifiez que `KKIAPAY_SECRET_KEY` et `KKIAPAY_PUBLIC_KEY` sont définis dans `.env`

### Erreur : "Transaction ID manquant"
- Vérifiez que KKIAPAY envoie bien le `transaction_id` dans le callback

### Le paiement ne se met pas à jour
- Vérifiez les logs du callback backend
- Vérifiez que la vérification serveur à serveur réussit
- Vérifiez que les métadonnées sont correctes

### Redirection vers une page blanche
- Vérifiez que `FRONTEND_URL` est correctement configuré
- Vérifiez que les routes `/payment-success` et `/payment-cancel` existent

---

## 📚 Ressources

- [Documentation KKIAPAY](https://docs.kkiapay.me)
- [API KKIAPAY](https://api.kkiapay.me)

---

## ✅ Checklist d'intégration

- [ ] Variables d'environnement configurées
- [ ] Routes backend testées
- [ ] Service frontend fonctionnel
- [ ] Composant KkiapayButton intégré
- [ ] Pages de callback créées
- [ ] Tests de paiement effectués
- [ ] Logs de callback vérifiés
- [ ] Sécurité (vérification serveur à serveur) active

---

**Dernière mise à jour :** 2025-01-27

