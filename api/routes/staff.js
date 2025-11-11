const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const superAdminOnly = (req, res, next) => {
    if (req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ msg: 'Accès refusé' });
    next();
};
const adminOrSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ msg: 'Accès refusé' });
    next();
};
router.post('/create-super-admin', [auth, superAdminOnly], async (req, res) => {
    try {
        const { email, password, nom, prenom } = req.body;
        if (!email || !password || !nom || !prenom) return res.status(400).json({ msg: 'Champs requis' });
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Email existe déjà' });
        user = new User({ email, password, nom, prenom, role: 'SUPER_ADMIN', status: 'ACTIF', score: 99 });
        await user.save();
        res.status(201).json({ msg: 'SUPER_ADMIN créé', user });
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});
router.post('/create-admin', [auth, superAdminOnly], async (req, res) => {
    try {
        const { email, password, nom, prenom } = req.body;
        if (!email || !password || !nom || !prenom) return res.status(400).json({ msg: 'Champs requis' });
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Email existe déjà' });
        user = new User({ email, password, nom, prenom, role: 'ADMIN', status: 'ACTIF', score: 99 });
        await user.save();
        res.status(201).json({ msg: 'ADMIN créé', user });
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});
router.post('/create-moderateur', [auth, superAdminOnly], async (req, res) => {
    try {
        const { email, password, nom, prenom } = req.body;
        if (!email || !password || !nom || !prenom) return res.status(400).json({ msg: 'Champs requis' });
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Email existe déjà' });
        user = new User({ email, password, nom, prenom, role: 'MODERATEUR', status: 'ACTIF', score: 99 });
        await user.save();
        res.status(201).json({ msg: 'MODERATEUR créé', user });
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});
router.get('/', [auth, adminOrSuperAdmin], async (req, res) => {
    try {
        const staff = await User.find({ role: { $in: ['ADMIN', 'MODERATEUR', 'SUPER_ADMIN'] } }).select('-password');
        res.json(staff);
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});
router.put('/:id', [auth, superAdminOnly], async (req, res) => {
    try {
        const { status } = req.body;
        if (!['ACTIF', 'SUSPENDU', 'BLOQUE'].includes(status)) return res.status(400).json({ msg: 'Status invalide' });
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        user.status = status;
        await user.save();
        res.json({ msg: 'STAFF modifié', user });
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});
module.exports = router;
