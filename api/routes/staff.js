const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ====================================
// MIDDLEWARE DE VÉRIFICATION DES RÔLES
// ====================================

const superAdminOnly = (req, res, next) => {
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ msg: 'Accès refusé. Seul SUPER_ADMIN peut accéder.' });
    }
    next();
};

const adminOrSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ msg: 'Accès refusé. Seul ADMIN+ peut accéder.' });
    }
    next();
};

// ====================================
// 1. CRÉER UN SUPER_ADMIN
// ====================================
router.post('/create-super-admin', [auth, superAdminOnly], async (req, res) => {
    try {
        const { email, password, nom, prenom, telephone, pieceIdentite, dateDeNaissance } = req.body;

        if (!email || !password || !nom || !prenom) {
            return res.status(400).json({ msg: 'Email, password, nom et prenom sont requis.' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Un utilisateur avec cet email existe déjà.' });
        }

        user = new User({
            email,
            password,
            nom,
            prenom,
            telephone: telephone || 'N/A',
            pieceIdentite: pieceIdentite || 'N/A',
            dateDeNaissance: dateDeNaissance || 'N/A',
            role: 'SUPER_ADMIN',
            status: 'ACTIF',
            isEmailVerified: true,
            score: 99,
        });

        await user.save();
        res.status(201).json({ msg: 'SUPER_ADMIN créé avec succès.', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// ====================================
// 2. CRÉER UN ADMIN
// ====================================
router.post('/create-admin', [auth, superAdminOnly], async (req, res) => {
    try {
        const { email, password, nom, prenom, telephone, pieceIdentite, dateDeNaissance } = req.body;

        if (!email || !password || !nom || !prenom) {
            return res.status(400).json({ msg: 'Email, password, nom et prenom sont requis.' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Un utilisateur avec cet email existe déjà.' });
        }

        user = new User({
            email,
            password,
            nom,
            prenom,
            telephone: telephone || 'N/A',
            pieceIdentite: pieceIdentite || 'N/A',
            dateDeNaissance: dateDeNaissance || 'N/A',
            role: 'ADMIN',
            status: 'ACTIF',
            isEmailVerified: true,
            score: 99,
        });

        await user.save();
        res.status(201).json({ msg: 'ADMIN créé avec succès.', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// ====================================
// 3. CRÉER UN MODERATEUR
// ====================================
router.post('/create-moderateur', [auth, superAdminOnly], async (req, res) => {
    try {
        const { email, password, nom, prenom, telephone, pieceIdentite, dateDeNaissance } = req.body;

        if (!email || !password || !nom || !prenom) {
            return res.status(400).json({ msg: 'Email, password, nom et prenom sont requis.' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Un utilisateur avec cet email existe déjà.' });
        }

        user = new User({
            email,
            password,
            nom,
            prenom,
            telephone: telephone || 'N/A',
            pieceIdentite: pieceIdentite || 'N/A',
            dateDeNaissance: dateDeNaissance || 'N/A',
            role: 'MODERATEUR',
            status: 'ACTIF',
            isEmailVerified: true,
            score: 99,
        });

        await user.save();
        res.status(201).json({ msg: 'MODERATEUR créé avec succès.', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// ====================================
// 4. CRÉER UN CLIENT (SUPER_ADMIN + ADMIN)
// ====================================
router.post('/create-client', [auth, adminOrSuperAdmin], async (req, res) => {
    try {
        const { email, password, nom, prenom, telephone, pieceIdentite, dateDeNaissance } = req.body;

        if (!email || !password || !nom || !prenom) {
            return res.status(400).json({ msg: 'Email, password, nom et prenom sont requis.' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Un utilisateur avec cet email existe déjà.' });
        }

        user = new User({
            email,
            password,
            nom,
            prenom,
            telephone: telephone || 'N/A',
            pieceIdentite: pieceIdentite || 'N/A',
            dateDeNaissance: dateDeNaissance || 'N/A',
            role: 'CLIENT',
            status: 'EN_ATTENTE',
            isEmailVerified: true,
            score: 0,
        });

        await user.save();
        res.status(201).json({ msg: 'CLIENT créé avec succès.', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// ====================================
// 5. MODIFIER UN CLIENT (SUPER_ADMIN + ADMIN)
// ====================================
router.put('/clients/:id', [auth, adminOrSuperAdmin], async (req, res) => {
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

// ====================================
// 6. MODIFIER UN STAFF (SUPER_ADMIN only)
// ====================================
router.put('/:id', [auth, superAdminOnly], async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.params.id;

        if (!['ACTIF', 'SUSPENDU', 'BLOQUE'].includes(status)) {
            return res.status(400).json({ msg: 'Status invalide. Doit être ACTIF, SUSPENDU ou BLOQUE.' });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: "ID invalide." });
        }
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur non trouvé.' });
        }

        if (!['ADMIN', 'MODERATEUR', 'SUPER_ADMIN'].includes(user.role)) {
            return res.status(403).json({ msg: 'Vous ne pouvez modifier que les STAFF.' });
        }

        user.status = status;
        await user.save();

        res.json({ msg: `STAFF modifié avec succès. Status: ${status}`, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

module.exports = router;
