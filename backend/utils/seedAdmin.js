const mongoose = require('mongoose');
const User = require('../models/User');

const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGO_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Veuillez fournir MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD');
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO_URI);
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('Admin déjà existant:', ADMIN_EMAIL);
    await mongoose.disconnect();
    return;
  }
  const admin = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  });
  console.log('Admin créé:', admin.email);
  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});


