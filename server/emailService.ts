import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'mail.infomaniak.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'contact@invexqr.com',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'contact@invexqr.com',
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendContactFormEmail(formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    const html = `
      <h2>Nouveau message de contact - InvexQR</h2>
      <p><strong>Nom:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Sujet:</strong> ${formData.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${formData.message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>Message envoyé depuis le formulaire de contact InvexQR</small></p>
    `;

    return await this.sendEmail({
      to: 'contact@invexqr.com',
      subject: `[InvexQR Contact] ${formData.subject}`,
      html,
      text: `Nouveau message de contact:
Nom: ${formData.name}
Email: ${formData.email}
Sujet: ${formData.subject}
Message: ${formData.message}`,
    });
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const html = `
      <h2>Bienvenue sur InvexQR !</h2>
      <p>Bonjour ${userName},</p>
      <p>Merci de vous être inscrit sur InvexQR, votre plateforme de génération de QR codes dynamiques.</p>
      <p>Vous pouvez maintenant :</p>
      <ul>
        <li>Créer des QR codes dynamiques personnalisés</li>
        <li>Suivre les analytics en temps réel</li>
        <li>Modifier les destinations sans régénérer les codes</li>
        <li>Accéder aux statistiques détaillées par pays et appareil</li>
      </ul>
      <p>Commencez dès maintenant votre essai gratuit de 14 jours !</p>
      <p>Cordialement,<br>L'équipe InvexQR</p>
      <hr>
      <p><small>Contact: contact@invexqr.com</small></p>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: 'Bienvenue sur InvexQR - Votre essai gratuit commence !',
      html,
      text: `Bienvenue sur InvexQR !

Bonjour ${userName},

Merci de vous être inscrit sur InvexQR. Vous pouvez maintenant créer des QR codes dynamiques et suivre vos analytics en temps réel.

Commencez votre essai gratuit de 14 jours dès maintenant !

Cordialement,
L'équipe InvexQR
Contact: contact@invexqr.com`,
    });
  }

  async sendQRCodeCreatedEmail(userEmail: string, userName: string, qrCodeName: string, qrCodeUrl: string): Promise<boolean> {
    const html = `
      <h2>QR Code créé avec succès !</h2>
      <p>Bonjour ${userName},</p>
      <p>Votre QR Code "<strong>${qrCodeName}</strong>" a été créé avec succès sur InvexQR.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3>Détails du QR Code :</h3>
        <p><strong>Nom :</strong> ${qrCodeName}</p>
        <p><strong>URL de redirection :</strong> ${qrCodeUrl}</p>
        <p><strong>Date de création :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>
      <p>Vous pouvez maintenant partager votre QR Code et suivre ses performances dans votre dashboard.</p>
      <p>Cordialement,<br>L'équipe InvexQR</p>
      <hr>
      <p><small>Contact: contact@invexqr.com</small></p>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: `QR Code créé : ${qrCodeName}`,
      html,
      text: `QR Code créé avec succès !

Bonjour ${userName},

Votre QR Code "${qrCodeName}" a été créé avec succès.
URL de redirection : ${qrCodeUrl}
Date de création : ${new Date().toLocaleDateString('fr-FR')}

Consultez votre dashboard pour suivre ses performances.

Cordialement,
L'équipe InvexQR`,
    });
  }

  async sendQRCodeScannedEmail(userEmail: string, userName: string, qrCodeName: string, scanLocation: string): Promise<boolean> {
    const html = `
      <h2>Nouveau scan de QR Code !</h2>
      <p>Bonjour ${userName},</p>
      <p>Votre QR Code "<strong>${qrCodeName}</strong>" vient d'être scanné.</p>
      <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3>Détails du scan :</h3>
        <p><strong>QR Code :</strong> ${qrCodeName}</p>
        <p><strong>Localisation :</strong> ${scanLocation}</p>
        <p><strong>Date et heure :</strong> ${new Date().toLocaleString('fr-FR')}</p>
      </div>
      <p>Consultez votre dashboard pour voir toutes les statistiques détaillées.</p>
      <p>Cordialement,<br>L'équipe InvexQR</p>
      <hr>
      <p><small>Contact: contact@invexqr.com</small></p>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: `QR Code scanné : ${qrCodeName}`,
      html,
      text: `Nouveau scan de QR Code !

Bonjour ${userName},

Votre QR Code "${qrCodeName}" vient d'être scanné.
Localisation : ${scanLocation}
Date et heure : ${new Date().toLocaleString('fr-FR')}

Consultez votre dashboard pour les statistiques détaillées.

Cordialement,
L'équipe InvexQR`,
    });
  }

  async sendActionNotificationEmail(userEmail: string, userName: string, action: string, details: string): Promise<boolean> {
    const html = `
      <h2>Action effectuée sur InvexQR</h2>
      <p>Bonjour ${userName},</p>
      <p>Une action a été effectuée sur votre compte InvexQR :</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3>Détails de l'action :</h3>
        <p><strong>Action :</strong> ${action}</p>
        <p><strong>Détails :</strong> ${details}</p>
        <p><strong>Date et heure :</strong> ${new Date().toLocaleString('fr-FR')}</p>
      </div>
      <p>Cordialement,<br>L'équipe InvexQR</p>
      <hr>
      <p><small>Contact: contact@invexqr.com</small></p>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: `Action effectuée : ${action}`,
      html,
      text: `Action effectuée sur InvexQR

Bonjour ${userName},

Action : ${action}
Détails : ${details}
Date et heure : ${new Date().toLocaleString('fr-FR')}

Cordialement,
L'équipe InvexQR`,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();