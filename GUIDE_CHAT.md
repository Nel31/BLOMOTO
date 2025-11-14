# 💬 Guide du Système de Chat - Promoto

Ce guide explique comment fonctionne le système de chat entre clients et garagistes.

## 📖 Fonctionnement général

Le chat fonctionne avec **deux technologies** :
1. **API REST** : Pour charger et sauvegarder les messages dans la base de données
2. **Socket.io** : Pour recevoir les messages en temps réel (instantané)

---

## 🔄 Flux de fonctionnement

### Étape 1 : Démarrer une conversation

**Pour un Client :**
1. Aller dans **"Mes rendez-vous"** (`/app/appointments`)
2. Cliquer sur un rendez-vous
3. Cliquer sur **"Contacter le garagiste"** → ouvre le chat
4. OU aller directement dans **"Messages"** (`/app/messages`)
5. Cliquer sur une conversation existante

**Pour un Garagiste :**
1. Dans le **Dashboard garagiste** (`/garage`)
2. Section **"Messages Clients"** → voir les conversations
3. OU aller dans **"Messages"** (`/garage/messages`)
4. Cliquer sur une conversation pour répondre

### Étape 2 : Envoyer un message

1. **Taper votre message** dans le champ de texte
2. **Appuyer sur "Entrée"** OU cliquer sur **"Envoyer"**
3. Le message est :
   - Sauvegardé dans la base de données (MongoDB)
   - Envoyé via Socket.io au destinataire en temps réel
   - Affiché immédiatement dans votre interface

### Étape 3 : Recevoir un message

Quand quelqu'un vous envoie un message :
1. **Socket.io** reçoit le message en temps réel
2. Le message apparaît **automatiquement** dans votre chat
3. Un **badge de notification** apparaît sur la conversation
4. Les messages non lus sont comptabilisés

---

## 🔧 Architecture technique

### Backend

```
📁 backend/
  ├── models/Message.js          → Modèle de données des messages
  ├── controllers/messageController.js  → Logique métier
  ├── routes/messages.js         → Routes API REST
  └── server.js                  → Configuration Socket.io
```

**Routes API :**
- `POST /api/messages` → Envoyer un message
- `GET /api/messages/conversations` → Liste des conversations
- `GET /api/messages/conversation/:userId` → Messages d'une conversation
- `PUT /api/messages/read` → Marquer comme lu

**Socket.io Events :**
- `join-room` → Rejoindre une conversation
- `send-message` → Envoyer un message en temps réel
- `new-message` → Recevoir un nouveau message

### Frontend

```
📁 web/src/
  ├── services/socket.ts           → Service Socket.io
  ├── components/Chat/
  │   ├── ChatList.tsx              → Liste des conversations
  │   └── ChatWindow.tsx           → Fenêtre de chat
  └── pages/
      ├── MessagesPage.tsx          → Page messages client
      └── GarageMessagesPage.tsx   → Page messages garagiste
```

---

## 🎯 Comment démarrer une conversation

### Scénario 1 : Client → Garagiste (depuis un rendez-vous)

1. Client va dans **"Mes rendez-vous"**
2. Trouve un rendez-vous avec un garage
3. Clique sur **"Contacter le garagiste"** (bouton 💬)
4. La conversation s'ouvre automatiquement
5. Le message peut être lié au rendez-vous

### Scénario 2 : Client → Garagiste (directement)

1. Client va sur la **page d'un garage** (`/app/garage/:id`)
2. Clique sur **"Contacter"** ou **"Message"**
3. La conversation s'ouvre avec le garagiste
4. Le client peut poser des questions avant de réserver

### Scénario 3 : Garagiste → Client

1. Garagiste va dans **Dashboard** → **"Messages Clients"**
2. Voit la liste des clients avec qui il a déjà communiqué
3. Clique sur un client → ouvre la conversation
4. Peut répondre aux questions

---

## 💡 Fonctionnalités

### ✅ Messages en temps réel
- Les messages apparaissent **instantanément** grâce à Socket.io
- Pas besoin de rafraîchir la page

### ✅ Historique des conversations
- Tous les messages sont sauvegardés dans MongoDB
- L'historique complet est chargé à l'ouverture

### ✅ Notifications
- Badge avec nombre de messages non lus
- Compteur visible sur la liste des conversations

### ✅ Messages liés aux rendez-vous
- Possibilité d'associer un message à un rendez-vous spécifique
- Utile pour discuter d'un problème précis

---

## 🔍 Dépannage

### Messages ne s'affichent pas en temps réel

1. Vérifier que Socket.io est bien connecté :
   - Ouvrir la console du navigateur (F12)
   - Chercher : `✅ Connecté au serveur Socket.io`

2. Vérifier `FRONTEND_URL` dans `backend/.env` :
   ```env
   FRONTEND_URL=http://localhost:5173
   ```

3. Vérifier que le serveur backend démarre bien avec Socket.io

### Conversations vides

1. Vérifier que vous avez bien envoyé un premier message
2. Les conversations n'apparaissent qu'après le premier message envoyé

### Impossible d'envoyer un message

1. Vérifier que vous êtes bien connecté
2. Vérifier les erreurs dans la console du navigateur
3. Vérifier que l'API backend fonctionne

---

## 📱 Utilisation

### Interface Client

**Accès :**
- Menu utilisateur → **"💬 Messages"**
- URL : `/app/messages`

**Fonctionnalités :**
- Liste de toutes vos conversations
- Chat en temps réel
- Notifications de messages non lus

### Interface Garagiste

**Accès :**
- Dashboard → **"Messages"** (carte ou section)
- URL : `/garage/messages`

**Fonctionnalités :**
- Conversations avec tous les clients
- Messages liés aux rendez-vous
- Répondre aux questions clients

---

## 🚀 Améliorations futures possibles

- 📎 Pièces jointes (images, PDF)
- 🔔 Notifications push
- 📞 Appels vocaux/vidéo
- 🤖 Chatbot automatique
- 📊 Statistiques de conversation

---

**Le système de chat est maintenant fonctionnel ! Testez-le entre un compte client et un compte garagiste.** 🎉

