const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const WaitingListItem = require('../models/WaitingListItem');

// Middleware to check for Admin roles
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ msg: 'Accès refusé. Rôle administrateur requis.' });
    }
    next();
};

// @route   GET api/waiting-list
// @desc    Get all waiting list items (sorted by priority)
// @access  Private (Admin)
router.get('/', [auth, adminAuth], async (req, res) => {
    try {
        const waitingList = await WaitingListItem.find()
            .populate('userId', ['prenom', 'nom', 'email'])
            .sort({ priority: 1, position: 1 });
        res.json(waitingList);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   POST api/waiting-list/:id/activate
// @desc    Activate a user from waiting list
// @access  Private (Admin)
router.post('/:id/activate', [auth, adminAuth], async (req, res) => {
    try {
        const waitingItem = await WaitingListItem.findById(req.params.id);
        if (!waitingItem) {
            return res.status(404).json({ msg: 'Élément de liste d\'attente non trouvé' });
        }

        // Update user status to ACTIF
        const user = await User.findById(waitingItem.userId);
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur non trouvé' });
        }

        user.status = 'ACTIF';
        user.dateActivation = Date.now();
        await user.save();

        // Remove from waiting list
        await WaitingListItem.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Client activé depuis la liste d\'attente', user });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

module.exports = router;
