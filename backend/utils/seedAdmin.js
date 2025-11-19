require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ Variables d\'environnement manquantes !');
  console.error('Veuillez fournir dans le fichier .env :');
  console.error('  - MONGODB_URI');
  console.error('  - ADMIN_NAME');
  console.error('  - ADMIN_EMAIL');
  console.error('  - ADMIN_PASSWORD');
  process.exit(1);
}

async function run() {
  console.log('🔌 Connexion à MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté à MongoDB');
  console.log('🔍 Vérification de l\'existence de l\'admin...');
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('⚠️  Admin déjà existant:', ADMIN_EMAIL);
    console.log('   Rôle:', existing.role);
    await mongoose.disconnect();
    return;
  }
  
  console.log('👤 Création de l\'admin...');
  const admin = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  });
  console.log('✅ Admin créé avec succès !');
  console.log('   Email:', admin.email);
  console.log('   Nom:', admin.name);
  console.log('   Rôle:', admin.role);
  await mongoose.disconnect();
  console.log('🔌 Déconnecté de MongoDB');
}

run().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});


