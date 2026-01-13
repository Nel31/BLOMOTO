# 🔹 Intégration FedaPay - Guide Complet

Ce guide détaille l'intégration complète du système de paiement FedaPay dans l'application BLOMOTO.

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
- Le backend communique avec l'API FedaPay
- Le frontend redirige l'utilisateur vers la page de paiement FedaPay

### Structure des fichiers

```
backend/
 ├─ controllers/
 │   └─ fedapayController.js      # Logique métier FedaPay
 ├─ routes/
 │   └─ payments.js               # Routes API
 └─ .env                          # Variables d'environnement

web/
 ├─ src/
 │   ├─ services/
 │   │   └─ paymentService.ts     # Service d'appel API
 │   ├─ components/
 │   │   └─ Payment/
 │   │       └─ FedapayButton.tsx # Composant bouton de paiement
 │   └─ pages/
 │       ├─ PaymentSuccessPage.tsx # Page de succès
 │       └─ PaymentCancelPage.tsx  # Page d'annulation
```

---

## ⚙️ Configuration Backend

### 1. Variables d'environnement

Ajoutez dans `backend/.env` :

```env
# FedaPay Configuration
FEDAPAY_API_KEY=votre_api_key_fedapay
FEDAPAY_ENVIRONMENT=sandbox  # 'sandbox' pour les tests, 'live' pour la production

# Frontend URL (pour les callbacks)
FRONTEND_URL=http://localhost:5173
```

### 2. Installation du package

```bash
cd backend
npm install fedapay
```

### 3. Routes disponibles

| Route | Méthode | Description | Accès |
|-------|---------|-------------|-------|
| `/api/payments/fedapay/create` | POST | Créer un paiement | Client (protégé) |
| `/api/payments/fedapay/status/:transactionId` | GET | Vérifier le statut | Protégé |
| `/api/payments/fedapay/callback` | POST | Webhook FedaPay | Public |

### 4. Fonctionnalités du contrôleur

#### `createFedapayPayment`
- Crée une transaction FedaPay
- Crée automatiquement un client FedaPay si nécessaire
- Supporte les paiements pour rendez-vous ou factures
- Génère les URLs de callback, return et cancel
- Inclut les métadonnées (userId, referenceId, referenceType)

#### `checkFedapayStatus`
- Vérifie le statut d'une transaction
- Met à jour automatiquement le rendez-vous/facture si payé

#### `fedapayCallback`
- **Webhook public** appelé par FedaPay après paiement
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

### 2. Composant FedapayButton

```tsx
import FedapayButton from '../components/Payment/FedapayButton';

<FedapayButton
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

Ces pages sont automatiquement appelées par FedaPay via les URLs `return_url` et `cancel_url`.

---

## 🚀 Utilisation

### Exemple 1 : Paiement d'un rendez-vous

```tsx
import FedapayButton from '../components/Payment/FedapayButton';

function AppointmentPayment({ appointmentId, amount }) {
  return (
    <FedapayButton
      appointmentId={appointmentId}
      amount={amount}
      currency="XOF"
      onSuccess={() => {
        console.log('Redirection vers FedaPay...');
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
<FedapayButton
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
    
    // Rediriger vers FedaPay
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
// 1. FedaPay appelle le callback avec les données
// 2. Le backend vérifie directement auprès de l'API FedaPay
const verifiedTransaction = await verifyPaymentWithFedapay(transaction_id);

// 3. Seulement si la vérification réussit, on met à jour la DB
if (verifiedTransaction.status === 'approved') {
  // Mettre à jour la base de données
}
```

### Bonnes pratiques

✅ **À faire :**
- Toujours vérifier le statut via l'API FedaPay
- Logger tous les callbacks pour audit
- Répondre rapidement à FedaPay (éviter les retries)
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
│ FedapayButton   │
└────┬────────────┘
     │ 2. POST /api/payments/fedapay/create
     ▼
┌─────────────────┐
│ Backend Node.js  │
│ fedapayController│
└────┬────────────┘
     │ 3. Transaction.create() via SDK FedaPay
     ▼
┌─────────────────┐
│ API FedaPay      │
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
│ Page FedaPay     │
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
│ API FedaPay      │
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
// POST /api/payments/fedapay/create
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
  "paymentUrl": "https://pay.fedapay.com/..."
}
```

### Frontend : Utilisation

```tsx
function PaymentPage() {
  const [appointment] = useState({ _id: '123', totalAmount: 5000 });
  
  return (
    <div>
      <h2>Paiement</h2>
      <FedapayButton
        appointmentId={appointment._id}
        amount={appointment.totalAmount}
        onSuccess={() => {
          console.log('Redirection vers FedaPay...');
        }}
      />
    </div>
  );
}
```

### Callback : Webhook FedaPay

```javascript
// POST /api/payments/fedapay/callback
{
  "transaction_id": "txn_123456",
  "status": "approved",
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

### Erreur : "FedaPay non configuré"
- Vérifiez que `FEDAPAY_API_KEY` est défini dans `.env`
- Vérifiez que `FEDAPAY_ENVIRONMENT` est défini (sandbox ou live)

### Erreur : "Transaction ID manquant"
- Vérifiez que FedaPay envoie bien le `transaction_id` dans le callback

### Le paiement ne se met pas à jour
- Vérifiez les logs du callback backend
- Vérifiez que la vérification serveur à serveur réussit
- Vérifiez que les métadonnées sont correctes

### Redirection vers une page blanche
- Vérifiez que `FRONTEND_URL` est correctement configuré
- Vérifiez que les routes `/payment-success` et `/payment-cancel` existent

### Erreur lors de la création du client
- Le contrôleur continue même si la création du client échoue
- Vérifiez que l'email et le téléphone sont valides

---

## 📚 Ressources

- [Documentation FedaPay](https://docs.fedapay.com)
- [SDK Node.js FedaPay](https://docs.fedapay.com/sdks/fr/nodejs-fr)
- [API FedaPay](https://docs.fedapay.com/integration-api/fr)

---

## ✅ Checklist d'intégration

- [ ] Variables d'environnement configurées
- [ ] Package `fedapay` installé dans le backend
- [ ] Routes backend testées
- [ ] Service frontend fonctionnel
- [ ] Composant FedapayButton intégré
- [ ] Pages de callback créées
- [ ] Tests de paiement effectués
- [ ] Logs de callback vérifiés
- [ ] Sécurité (vérification serveur à serveur) active

---

**Dernière mise à jour :** 2025-01-27
