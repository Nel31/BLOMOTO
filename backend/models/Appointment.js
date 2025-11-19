const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    paymentIntentId: {
      type: String,
    },
    totalAmount: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    vehicleInfo: {
      brand: { type: String },
      model: { type: String },
      year: { type: Number },
      licensePlate: { type: String },
      photos: [{ type: String }], // URLs Cloudinary des photos du véhicule
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

