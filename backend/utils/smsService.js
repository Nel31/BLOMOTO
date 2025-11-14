// Service SMS avec Twilio (optionnel)
const twilio = require('twilio');

let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

/**
 * Envoyer un SMS
 */
exports.sendSMS = async (to, message) => {
  try {
    if (!twilioClient) {
      console.warn('⚠️ Twilio non configuré - SMS non envoyé');
      return { success: false, message: 'Twilio non configuré' };
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('Erreur envoi SMS:', error);
    return { success: false, message: error.message };
  }
};

/**
 * SMS de confirmation de rendez-vous
 */
exports.sendAppointmentConfirmationSMS = async (appointment, client, garage) => {
  const date = new Date(appointment.date);
  const message = `Promoto: Rendez-vous confirmé avec ${garage.name} le ${date.toLocaleDateString('fr-FR')} à ${appointment.time}. Merci !`;
  
  if (client.phone) {
    return await this.sendSMS(client.phone, message);
  }
  return { success: false, message: 'Téléphone client non disponible' };
};

/**
 * SMS de rappel
 */
exports.sendAppointmentReminderSMS = async (appointment, client, garage) => {
  const date = new Date(appointment.date);
  const message = `Promoto: Rappel - Rendez-vous demain avec ${garage.name} le ${date.toLocaleDateString('fr-FR')} à ${appointment.time}.`;
  
  if (client.phone) {
    return await this.sendSMS(client.phone, message);
  }
  return { success: false, message: 'Téléphone client non disponible' };
};

module.exports = exports;

