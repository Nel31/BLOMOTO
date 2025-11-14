const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Garage = require('../models/Garage');
const emailService = require('./emailService');
const smsService = require('./smsService');

/**
 * Planifier les rappels de rendez-vous
 * Exécute chaque jour à 9h pour rappeler les rendez-vous du lendemain
 */
exports.scheduleAppointmentReminders = () => {
  // Exécuter chaque jour à 9h du matin
  cron.schedule('0 9 * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

      // Trouver tous les rendez-vous confirmés pour demain
      const appointments = await Appointment.find({
        date: { $gte: tomorrow, $lt: tomorrowEnd },
        status: { $in: ['pending', 'confirmed'] },
      })
        .populate('clientId', 'name email phone')
        .populate('garageId', 'name address');

      console.log(`📧 Envoi de ${appointments.length} rappels de rendez-vous...`);

      for (const appointment of appointments) {
        if (appointment.clientId && appointment.garageId) {
          // Email
          await emailService.sendAppointmentReminder(
            appointment,
            appointment.clientId,
            appointment.garageId
          );

          // SMS
          if (appointment.clientId.phone) {
            await smsService.sendAppointmentReminderSMS(
              appointment,
              appointment.clientId,
              appointment.garageId
            );
          }
        }
      }

      console.log(`✅ Rappels envoyés avec succès`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des rappels:', error);
    }
  });

  console.log('📅 Planificateur de rappels activé (9h chaque jour)');
};

module.exports = exports;

