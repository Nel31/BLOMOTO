const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Configuration Socket.io pour le chat en temps réel
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const rawOrigins =
  process.env.SOCKET_ALLOWED_ORIGINS ||
  process.env.FRONTEND_URL ||
  'http://localhost:5173';
const allowedOrigins = rawOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques depuis le dossier uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/promoto', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Connexion à MongoDB réussie');
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion à MongoDB:', err.message);
    process.exit(1);
  });

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'API Promoto - Bienvenue !',
    version: '1.0.0',
  });
});

// Importation des routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/garages', require('./routes/garages'));
app.use('/api/services', require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));

// Configuration Socket.io pour le chat
io.on('connection', (socket) => {
  console.log('👤 Utilisateur connecté:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Utilisateur ${socket.id} a rejoint la room ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`Utilisateur ${socket.id} a quitté la room ${roomId}`);
  });

  socket.on('send-message', (data) => {
    // Diffuser le message à tous les utilisateurs de la room
    io.to(data.roomId).emit('new-message', data);
  });

  socket.on('disconnect', () => {
    console.log('👤 Utilisateur déconnecté:', socket.id);
  });
});

// Exporter io pour utilisation dans les contrôleurs
app.set('io', io);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Planifier les rappels de rendez-vous
if (process.env.ENABLE_REMINDERS !== 'false') {
  const notificationScheduler = require('./utils/notificationScheduler');
  notificationScheduler.scheduleAppointmentReminders();
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

