const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

const adminOrSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ msg: 'Accès refusé. Seul ADMIN+ peut accéder.' });
    }
    next();
};

router.put('/:id', [auth, adminOrSuperAdmin], async (req, res) => {
    try {
        const { status, nom, prenom, telephone } = req.body;
        const userId = req.params.id;

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur non trouvé.' });
        }

        if (user.role !== 'CLIENT') {
            return res.status(403).json({ msg: 'Vous ne pouvez modifier que les CLIENTs.' });
        }

        if (nom) user.nom = nom;
        if (prenom) user.prenom = prenom;
        if (telephone) user.telephone = telephone;
        if (status) user.status = status;

        await user.save();
        res.json({ msg: 'CLIENT modifié avec succès.', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

module.exports = router;
