const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false, // Ne pas retourner le mot de passe par défaut
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['client', 'garagiste', 'admin'],
      default: 'client',
    },
    avatar: {
      type: String, // URL de l'image Cloudinary
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Informations spécifiques au garagiste
    garageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Garage',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hashage du mot de passe avant la sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

