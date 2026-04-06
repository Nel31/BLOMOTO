const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("../models/User");

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }
  return v;
}

async function main() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;
  const name = process.argv[4] || process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error(
      [
        "Usage:",
        "  node scripts/createAdmin.js <email> <password> [name]",
        "",
        "Ou via variables d'environnement:",
        "  ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME",
      ].join("\n")
    );
    process.exit(2);
  }

  const mongoUri = requiredEnv("MONGODB_URI");
  await mongoose.connect(mongoUri);

  const existing = await User.findOne({ email });

  if (existing) {
    existing.name = name;
    existing.role = "admin";
    existing.isActive = true;
    existing.password = password; // sera hashé par le pre('save')
    await existing.save();
    console.log(`✅ Admin mis à jour: ${existing.email} (${existing._id})`);
  } else {
    const created = await User.create({
      name,
      email,
      password,
      role: "admin",
      isActive: true,
    });
    console.log(`✅ Admin créé: ${created.email} (${created._id})`);
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("❌ Erreur:", err?.message || err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

