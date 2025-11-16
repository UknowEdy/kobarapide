const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

// @route   POST api/email/send-verification
// @desc    Send or resend email verification
// @access  Public (but requires valid email)
router.post('/send-verification', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur non trouvé' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ msg: 'Email déjà vérifié' });
        }

        // Generate token
        const token = generateToken();
        user.emailVerificationToken = token;
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();

        // Send email
        await sendVerificationEmail(user.email, token, user.prenom);

        res.json({ msg: 'Email de vérification envoyé' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   GET api/email/verify/:token
// @desc    Verify email with token
// @access  Public
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            emailVerificationToken: req.params.token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Token invalide ou expiré' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({ msg: 'Email vérifié avec succès', user: { email: user.email, isEmailVerified: true } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   POST api/email/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal if user exists
            return res.json({ msg: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé' });
        }

        // Generate token
        const token = generateToken();
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // Send email
        await sendPasswordResetEmail(user.email, token, user.prenom);

        res.json({ msg: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   POST api/email/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ msg: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    try {
        const user = await User.findOne({
            passwordResetToken: req.params.token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Token invalide ou expiré' });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({ msg: 'Mot de passe réinitialisé avec succès' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

module.exports = router;
