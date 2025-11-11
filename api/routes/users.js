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
        const { role, statut } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (statut) filter.statut = statut;
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

module.exports = router;
