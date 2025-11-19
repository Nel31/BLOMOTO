const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envoyer un email
 */
exports.sendEmail = async (to, subject, html, text) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ SMTP non configuré - Email non envoyé');
      return { success: false, message: 'SMTP non configuré' };
    }

    const info = await transporter.sendMail({
      from: `"Promoto" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || html,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Email de confirmation de rendez-vous
 */
exports.sendAppointmentConfirmation = async (appointment, client, garage) => {
  const date = new Date(appointment.date);
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Rendez-vous confirmé</h2>
      <p>Bonjour ${client.name},</p>
      <p>Votre rendez-vous a été confirmé avec succès !</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Garage:</strong> ${garage.name}</p>
        <p><strong>Date:</strong> ${date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p><strong>Heure:</strong> ${appointment.time}</p>
        <p><strong>Adresse:</strong> ${garage.address.street}, ${garage.address.city}</p>
      </div>
      <p>Cordialement,<br>L'équipe Promoto</p>
    </div>
  `;

  return await this.sendEmail(
    client.email,
    'Confirmation de rendez-vous - Promoto',
    html
  );
};

/**
 * Email de rappel de rendez-vous
 */
exports.sendAppointmentReminder = async (appointment, client, garage) => {
  const date = new Date(appointment.date);
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Rappel: Rendez-vous demain</h2>
      <p>Bonjour ${client.name},</p>
      <p>Nous vous rappelons que vous avez un rendez-vous demain :</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Garage:</strong> ${garage.name}</p>
        <p><strong>Date:</strong> ${date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p><strong>Heure:</strong> ${appointment.time}</p>
        <p><strong>Adresse:</strong> ${garage.address.street}, ${garage.address.city}</p>
      </div>
      <p>À bientôt !<br>L'équipe Promoto</p>
    </div>
  `;

  return await this.sendEmail(
    client.email,
    'Rappel de rendez-vous - Promoto',
    html
  );
};

/**
 * Email de notification au garagiste (nouveau rendez-vous)
 */
exports.sendNewAppointmentNotification = async (appointment, client, garage) => {
  const date = new Date(appointment.date);
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Nouveau rendez-vous</h2>
      <p>Bonjour,</p>
      <p>Vous avez reçu un nouveau rendez-vous pour votre garage ${garage.name}.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Client:</strong> ${client.name}</p>
        <p><strong>Date:</strong> ${date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p><strong>Heure:</strong> ${appointment.time}</p>
        ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
      </div>
      <p>Cordialement,<br>L'équipe Promoto</p>
    </div>
  `;

  if (garage.email) {
    return await this.sendEmail(
      garage.email,
      'Nouveau rendez-vous - Promoto',
      html
    );
  }
  return { success: false, message: 'Email garage non configuré' };
};

module.exports = exports;

