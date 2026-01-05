# 🧪 Comment Tester KKIAPAY depuis l'Application

Guide simple pour tester le paiement KKIAPAY directement depuis l'application.

---

## ⚙️ Configuration (1 minute)

### Backend `.env`
```env
KKIAPAY_SECRET_KEY=votre_secret_key
KKIAPAY_PUBLIC_KEY=votre_public_key
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Démarrer l'application

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd web
npm run dev
```

---

## 📱 Tester depuis l'application

### **Option 1 : Tester lors de la réservation**

1. **Aller sur** : `http://localhost:5173/app/garages`
2. **Sélectionner un garage**
3. **Créer un rendez-vous** :
   - Choisir un service
   - Sélectionner date et heure
   - Remplir les informations du véhicule
   - Cliquer sur "Confirmer la réservation"
4. **Choisir le paiement** :
   - Cocher "Payer maintenant"
   - **Sélectionner "KKIAPAY (Mobile Money)"**
   - Cliquer sur "Payer X XOF avec KKIAPAY"
5. **Vérifier** :
   - ✅ Redirection vers la page KKIAPAY
   - ✅ Ou message d'erreur si problème

---

### **Option 2 : Tester depuis mes rendez-vous**

1. **Aller sur** : `http://localhost:5173/app/appointments`
2. **Trouver un rendez-vous non payé**
3. **Cliquer sur le bouton** : "💳 Payer X XOF"
4. **Vérifier** :
   - ✅ Redirection vers KKIAPAY
   - ✅ Après paiement, redirection vers `/payment-success`
   - ✅ Le statut du rendez-vous est mis à jour

---

## ✅ Vérifications

### Après le paiement

1. **Page de succès** : `/payment-success`
   - Vérifie automatiquement le statut
   - Affiche un message de confirmation

2. **Base de données** :
   - Le rendez-vous a `paymentStatus: 'paid'`
   - Le `paymentIntentId` est enregistré

3. **Logs backend** :
   - Vous devriez voir : `📥 Callback KKIAPAY reçu`
   - Et : `✅ Rendez-vous mis à jour`

---

## 🐛 Problèmes courants

### "KKIAPAY non configuré"
→ Vérifiez `backend/.env`

### "Erreur lors de la création du paiement"
→ Vérifiez que vous êtes connecté en tant que client

### Redirection vers page blanche
→ Vérifiez `FRONTEND_URL` dans `backend/.env`

### Le bouton de paiement n'apparaît pas
→ Vérifiez que le rendez-vous n'est pas déjà payé (`paymentStatus !== 'paid'`)

---

## 📝 Notes

- Le bouton KKIAPAY apparaît uniquement pour les rendez-vous **non payés**
- Vous pouvez choisir entre **Stripe** et **KKIAPAY** lors de la réservation
- Après paiement, vous êtes automatiquement redirigé vers la page de succès

---

**C'est tout ! 🎉**

