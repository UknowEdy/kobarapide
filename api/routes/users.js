const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

const adminAuth = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ msg: 'Accès refusé' });
    }
    next();
};

router.get('/', [auth, adminAuth], async (req, res) => {
    try {
        const { role, status } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (status) filter.status = status;
        const users = await User.find(filter).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});

router.put('/:id/status', [auth, adminAuth], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'Non trouvé' });
        user.status = req.body.status;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});

// @route   PUT /api/users/:id
// @desc    Met à jour un utilisateur (status, score, etc.)
// @access  Private (ADMIN ou SUPER_ADMIN)
router.put('/:id', [auth, adminAuth], async (req, res) => {
    try {
        const { status, score, nom, prenom, telephone, rejectionReason } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur non trouvé' });
        }

        // Mise à jour des champs autorisés
        if (status !== undefined) {
            // Valider le statut
            const validStatuses = ['EN_ATTENTE', 'ACTIF', 'SUSPENDU', 'BLOQUE', 'REACTIVATION_EN_ATTENTE', 'INACTIF_EXCLU', 'EN_VERIFICATION_DOUBLON', 'REJETE'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ msg: 'Statut invalide' });
            }
            user.status = status;
        }

        if (score !== undefined) user.score = score;
        if (nom !== undefined) user.nom = nom;
        if (prenom !== undefined) user.prenom = prenom;
        if (telephone !== undefined) user.telephone = telephone;
        if (rejectionReason !== undefined) user.rejectionReason = rejectionReason;

        // Mettre à jour la date de dernière activité
        user.dateDerniereActivite = Date.now();

        await user.save();

        // Ne pas retourner le mot de passe
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({ msg: 'Utilisateur mis à jour', user: userResponse });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
