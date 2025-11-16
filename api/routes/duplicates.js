const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const PotentialDuplicate = require('../models/PotentialDuplicate');

// Middleware to check for Admin roles
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ msg: 'Accès refusé. Rôle administrateur requis.' });
    }
    next();
};

// @route   GET api/duplicates
// @desc    Get all potential duplicates (with optional status filter)
// @access  Private (Admin)
router.get('/', [auth, adminAuth], async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : { status: 'pending' };

        const duplicates = await PotentialDuplicate.find(query)
            .populate('existingUser', ['prenom', 'nom', 'email', 'telephone', 'pieceIdentite', 'dateDeNaissance'])
            .sort({ createdAt: -1 });

        res.json(duplicates);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   POST api/duplicates/resolve
// @desc    Resolve a duplicate (approve or reject)
// @access  Private (Admin)
router.post('/resolve', [auth, adminAuth], async (req, res) => {
    const { newUserEmail, action, reason } = req.body;

    try {
        const duplicate = await PotentialDuplicate.findOne({ 'newUser.email': newUserEmail, status: 'pending' });
        if (!duplicate) {
            return res.status(404).json({ msg: 'Doublon non trouvé ou déjà résolu' });
        }

        if (action === 'approve') {
            // Create the new user
            const newUser = new User({
                email: duplicate.newUser.email,
                password: 'tempPassword123', // Temporary, should be sent securely
                nom: duplicate.newUser.nom,
                prenom: duplicate.newUser.prenom,
                telephone: duplicate.newUser.telephone,
                pieceIdentite: duplicate.newUser.pieceIdentite,
                dateDeNaissance: duplicate.newUser.dateDeNaissance,
                status: 'EN_ATTENTE',
                role: 'CLIENT',
                isEmailVerified: false,
                score: 0,
            });
            await newUser.save();

            // Mark duplicate as approved
            duplicate.status = 'approved';
            duplicate.resolvedAt = Date.now();
            await duplicate.save();

            res.json({ msg: 'Inscription approuvée. Email de vérification envoyé.', user: newUser });

        } else if (action === 'reject') {
            // Create the new user with REJECTED status
            const rejectedUser = new User({
                email: duplicate.newUser.email,
                password: 'tempPassword123',
                nom: duplicate.newUser.nom,
                prenom: duplicate.newUser.prenom,
                telephone: duplicate.newUser.telephone,
                pieceIdentite: duplicate.newUser.pieceIdentite,
                dateDeNaissance: duplicate.newUser.dateDeNaissance,
                status: 'REJETE',
                role: 'CLIENT',
                isEmailVerified: false,
                score: 0,
                rejectionReason: reason || 'Rejeté en tant que doublon',
            });
            await rejectedUser.save();

            // Mark duplicate as rejected
            duplicate.status = 'rejected';
            duplicate.resolvedAt = Date.now();
            await duplicate.save();

            res.json({ msg: 'Inscription rejetée.', user: rejectedUser });

        } else {
            return res.status(400).json({ msg: 'Action invalide (approve/reject)' });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

module.exports = router;
