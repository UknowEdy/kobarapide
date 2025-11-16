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

// @route   POST /api/staff
// @desc    Créer un membre du staff (ADMIN ou MODERATEUR)
// @access  Private (ADMIN ou SUPER_ADMIN)
router.post('/', [auth, adminOrSuperAdmin], async (req, res) => {
    try {
        const { email, password, nom, prenom, telephone, pieceIdentite, dateDeNaissance, role } = req.body;

        // Validation des champs requis
        if (!email || !password || !nom || !prenom || !telephone || !pieceIdentite || !dateDeNaissance || !role) {
            return res.status(400).json({ msg: 'Tous les champs sont requis' });
        }

        // Validation du rôle
        if (!['ADMIN', 'MODERATEUR'].includes(role)) {
            return res.status(400).json({ msg: 'Rôle invalide. Seuls ADMIN et MODERATEUR sont autorisés.' });
        }

        // Vérifier que seul un SUPER_ADMIN peut créer un autre ADMIN
        if (role === 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ msg: 'Seul un SUPER_ADMIN peut créer un ADMIN.' });
        }

        // Vérifier que l'email n'existe pas déjà
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'Un utilisateur avec cet email existe déjà' });
        }

        // Créer le membre du staff
        const staffMember = new User({
            email,
            password,
            nom,
            prenom,
            telephone,
            pieceIdentite,
            dateDeNaissance,
            role,
            status: 'ACTIF',
            score: 5,
            isEmailVerified: true
        });

        await staffMember.save();

        // Ne pas retourner le mot de passe
        const staffResponse = staffMember.toObject();
        delete staffResponse.password;

        res.status(201).json({
            msg: `${role} créé avec succès`,
            user: staffResponse
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
