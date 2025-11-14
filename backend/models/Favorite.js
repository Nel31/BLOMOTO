const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    garageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Garage',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Un client ne peut avoir un garage qu'une seule fois en favori
favoriteSchema.index({ clientId: 1, garageId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);

