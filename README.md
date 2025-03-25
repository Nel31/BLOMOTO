# **BLOMOTO - Gestion numérique des garages automobiles** 🚗💻

## **📌 Introduction**
BLOMOTO est une plateforme web innovante conçue pour simplifier la gestion des garages automobiles. Grâce à un **backend robuste en Django** et un **frontend interactif en React.js**, elle permet aux garages de gérer leurs services, aux clients de prendre rendez-vous facilement et aux administrateurs de superviser l’ensemble du système.

---

## **🎯 Fonctionnalités principales**
✅ **Inscription et connexion sécurisées** avec JWT (JSON Web Token).  
✅ **Gestion des services** : ajout, modification et suppression des prestations offertes par les garages.  
✅ **Réservation en ligne** avec calendrier intégré et notifications.  
✅ **Système de rôles** : administrateurs, garagistes et clients avec des permissions spécifiques.  
✅ **Messagerie intégrée** entre garages et clients pour un suivi efficace.  
✅ **Interface moderne et responsive** avec **React.js** et **Tailwind CSS**.  

---

## **🛠️ Stack technologique**
### **Frontend** (blomoto-app) 🚀
- **React.js** : Gestion des interfaces utilisateur.
- **Vite.js** : Compilation et optimisation rapide du projet.
- **Tailwind CSS** : Styling moderne et responsive.
- **Axios** : Gestion des appels API vers le backend.

### **Backend** (blomotobackend) ⚙️
- **Django** : Framework backend robuste et sécurisé.
- **Django REST Framework** : Création et gestion des API.
- **SQLite** : Base de données légère et efficace.
- **JWT (JSON Web Token)** : Authentification sécurisée.

---

## **📂 Structure du projet**
```
blomoto/
│── blomoto-app/             # Frontend React.js
│   ├── src/
│   │   ├── components/      # Composants UI réutilisables
│   │   ├── pages/           # Pages principales (Accueil, Login, Dashboard...)
│   │   ├── config/api.js    # Configuration des appels API
│   ├── public/
│   ├── package.json         # Dépendances frontend
│   ├── vite.config.js       # Configuration Vite.js
│
│── blomotobackend/          # Backend Django
│   ├── garage_app/          # Gestion des garages et services
│   ├── user_app/            # Gestion des utilisateurs et authentification
│   ├── service_app/         # Gestion des services et prestations
│   ├── requirements.txt     # Dépendances backend
│   ├── manage.py            # Commandes Django
│
│── docs/                    # Documentation technique
│── README.md                # Documentation principale
```

---

## **🚀 Installation et démarrage**
### **1️⃣ Cloner le projet**
```bash
$ git clone https://github.com/ton-repo/blomoto.git
$ cd blomoto
```

### **2️⃣ Installation du backend** (Django)
```bash
$ cd blomotobackend
$ pip install -r requirements.txt
$ python manage.py migrate  # Exécuter les migrations
$ python manage.py runserver  # Lancer le serveur Django
```

### **3️⃣ Installation du frontend** (React.js)
```bash
$ cd ../blomoto-app
$ npm install
$ npm run dev  # Lancer l'application React
```

---

## **🛠️ API Endpoints (Exemples)**
- **Authentification** : `POST /api/auth/login/` (connexion utilisateur)
- **Liste des garages** : `GET /api/garages/`
- **Détails d’un garage** : `GET /api/garages/{id}/`
- **Création d’un service** : `POST /api/services/`
- **Réservation d’un rendez-vous** : `POST /api/reservations/`

---

## **📝 Contribuer au projet**
1. **Fork le projet**
2. **Crée une branche** (`git checkout -b feature-ma-fonctionnalite`)
3. **Fais tes modifications** et commits (`git commit -m 'Ajout de ma fonctionnalité'`)
4. **Push ta branche** (`git push origin feature-ma-fonctionnalite`)
5. **Crée une Pull Request**

---

## **🔒 Sécurité et bonnes pratiques**
✅ Utilisation de **JWT** pour sécuriser l’authentification.  
✅ Protection CSRF activée sur Django.  
✅ API REST sécurisée avec des permissions par rôles (admin, garage, client).  
✅ Gestion des erreurs et logs pour suivre les activités suspectes.

---

## **🛎️ Support et contact**
📧 Contact : support@blomoto.com  
📌 Site officiel : [www.blomoto.com](http://www.blomoto.com)  

