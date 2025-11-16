const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter (using environment variables for production)
const createTransporter = () => {
    // For development, use ethereal.email or configure with real SMTP
    // For production, use environment variables
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // Development fallback - logs to console
    return {
        sendMail: async (mailOptions) => {
            console.log('📧 EMAIL (Development Mode):');
            console.log('To:', mailOptions.to);
            console.log('Subject:', mailOptions.subject);
            console.log('Content:', mailOptions.text || mailOptions.html);
            console.log('---');
            return { messageId: 'dev-' + Date.now() };
        }
    };
};

// Generate verification token
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Send email verification
const sendVerificationEmail = async (email, token, userName) => {
    const transporter = createTransporter();

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@kobarapide.com',
        to: email,
        subject: 'Vérification de votre email - Kobarapide',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f97316;">Bienvenue sur Kobarapide, ${userName}!</h2>
                <p>Merci de vous être inscrit. Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}"
                       style="background-color: #f97316; color: white; padding: 12px 30px;
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Vérifier mon email
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur:<br>
                    <a href="${verificationUrl}">${verificationUrl}</a>
                </p>
                <p style="color: #666; font-size: 14px;">
                    Ce lien expire dans 24 heures.
                </p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="color: #999; font-size: 12px;">
                    Si vous n'avez pas créé de compte Kobarapide, ignorez cet email.
                </p>
            </div>
        `,
        text: `Bienvenue sur Kobarapide, ${userName}!\n\nVeuillez vérifier votre email en cliquant sur ce lien: ${verificationUrl}\n\nCe lien expire dans 24 heures.`
    };

    return await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (email, token, userName) => {
    const transporter = createTransporter();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@kobarapide.com',
        to: email,
        subject: 'Réinitialisation de votre mot de passe - Kobarapide',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f97316;">Réinitialisation de mot de passe</h2>
                <p>Bonjour ${userName},</p>
                <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}"
                       style="background-color: #f97316; color: white; padding: 12px 30px;
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Réinitialiser mon mot de passe
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur:<br>
                    <a href="${resetUrl}">${resetUrl}</a>
                </p>
                <p style="color: #666; font-size: 14px;">
                    Ce lien expire dans 1 heure.
                </p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="color: #999; font-size: 12px;">
                    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                </p>
            </div>
        `,
        text: `Bonjour ${userName},\n\nVous avez demandé à réinitialiser votre mot de passe.\n\nCliquez sur ce lien: ${resetUrl}\n\nCe lien expire dans 1 heure.`
    };

    return await transporter.sendMail(mailOptions);
};

// Send welcome email after activation
const sendWelcomeEmail = async (email, userName) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@kobarapide.com',
        to: email,
        subject: 'Bienvenue sur Kobarapide!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f97316;">Bienvenue ${userName}!</h2>
                <p>Votre compte Kobarapide a été activé avec succès.</p>
                <p>Vous pouvez maintenant:</p>
                <ul>
                    <li>Faire une demande de prêt</li>
                    <li>Suivre vos remboursements</li>
                    <li>Parrainer d'autres membres</li>
                </ul>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}"
                       style="background-color: #f97316; color: white; padding: 12px 30px;
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Accéder à mon compte
                    </a>
                </div>
            </div>
        `,
        text: `Bienvenue ${userName}!\n\nVotre compte Kobarapide a été activé avec succès.`
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = {
    generateToken,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail
};
