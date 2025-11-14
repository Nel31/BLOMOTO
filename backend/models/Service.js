const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    garageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Garage',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Le nom du service est requis'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'reparation',
        'entretien',
        'depannage',
        'vente-pieces',
        'carrosserie',
        'peinture',
        'revision',
        'autre',
      ],
      required: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    priceType: {
      type: String,
      enum: ['fixe', 'variable', 'sur-devis'],
      default: 'variable',
    },
    duration: {
      type: Number, // Durée estimée en minutes
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Service', serviceSchema);

