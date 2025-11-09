const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const LoanApplication = require('../models/LoanApplication');

// Middleware to check for Admin roles
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ msg: 'Accès refusé. Rôle administrateur requis.' });
    }
    next();
};

// @route   GET api/users
// @desc    Get all users (for admin)
// @access  Private (Admin)
router.get('/', [auth, adminAuth], async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   PUT api/users/:id/status
// @desc    Update user status (for admin)
// @access  Private (Admin)
router.put('/:id/status', [auth, adminAuth], async (req, res) => {
    const { status, reason } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur non trouvé' });
        }
        user.status = status;
        if (reason) user.rejectionReason = reason;
        if (status === 'ACTIF') {
            user.dateActivation = Date.now();
        }
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   POST api/users/:id/resend-verification
// @desc    Resend verification email
// @access  Private (Admin)
router.post('/:id/resend-verification', [auth, adminAuth], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur non trouvé' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ msg: 'Cet utilisateur a déjà vérifié son email' });
        }

        // Simulate sending verification email
        console.log(`✉️ SIMULATION: Email de vérification envoyé à ${user.email}`);

        res.json({ msg: 'Email de vérification renvoyé avec succès' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   POST api/users/:id/request-unblocking
// @desc    Request account unblocking
// @access  Private (User or Admin)
router.post('/:id/request-unblocking', auth, async (req, res) => {
    try {
        // Check if user is requesting for themselves or is admin
        if (req.user.id !== req.params.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ msg: 'Accès refusé' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur non trouvé' });
        }

        if (user.status !== 'BLOQUE') {
            return res.status(400).json({ msg: 'Cet utilisateur n\'est pas bloqué' });
        }

        user.status = 'REACTIVATION_EN_ATTENTE';
        await user.save();

        res.json({ msg: 'Demande de déblocage envoyée. Un administrateur la traitera bientôt.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

module.exports = router;
