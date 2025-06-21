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

    this.transporter = nodemailer.createTransporter(config);
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