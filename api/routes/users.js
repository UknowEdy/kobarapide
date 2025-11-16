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
        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});

router.put('/:id', [auth, adminAuth], async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé' });

        if (status) user.status = status;
        if (rejectionReason) user.rejectionReason = rejectionReason;
        if (status === 'ACTIF' && !user.dateActivation) {
            user.dateActivation = Date.now();
        }

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
