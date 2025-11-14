const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false, // Vérifié si basé sur un rendez-vous réel
    },
  },
  {
    timestamps: true,
  }
);

// Un client ne peut laisser qu'un seul avis par garage
reviewSchema.index({ clientId: 1, garageId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

