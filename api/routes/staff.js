const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/authMiddleware');
const superAdminAuth = require('../middleware/superAdminAuth');
const User = require('../models/User');

// @route   POST api/staff
// @desc    Add a staff member (SUPER_ADMIN only)
// @access  Private (Super Admin)
router.post('/', [auth, superAdminAuth], async (req, res) => {
    const { email, password, nom, prenom, role } = req.body;

    try {
        // Check if email already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Un utilisateur avec cet email existe déjà' });
        }

        // Validate role
        if (role !== 'ADMIN' && role !== 'MODERATEUR' && role !== 'SUPER_ADMIN') {
            return res.status(400).json({ msg: 'Rôle invalide' });
        }

        // Create new staff member
        user = new User({
            email,
            password,
            nom,
            prenom,
            telephone: 'N/A',
            pieceIdentite: 'N/A',
            dateDeNaissance: 'N/A',
            role,
            status: 'ACTIF',
            isEmailVerified: true,
            score: 99,
        });

        await user.save();
        res.status(201).json({ msg: 'Membre du staff ajouté avec succès', user });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   PUT api/staff/:id/role
// @desc    Update staff member role (SUPER_ADMIN only)
// @access  Private (Super Admin)
router.put('/:id/role', [auth, superAdminAuth], async (req, res) => {
    const { role } = req.body;

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur non trouvé' });
        }

        // Can't change role of another super admin unless you're the one
        if (user.role === 'SUPER_ADMIN' && user._id.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Vous ne pouvez pas modifier un Super Admin' });
        }

        // Validate new role
        if (role !== 'ADMIN' && role !== 'MODERATEUR' && role !== 'SUPER_ADMIN') {
            return res.status(400).json({ msg: 'Rôle invalide' });
        }

        user.role = role;
        await user.save();
        res.json({ msg: 'Rôle mis à jour', user });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   DELETE api/staff/:id
// @desc    Delete a staff member (SUPER_ADMIN only)
// @access  Private (Super Admin)
router.delete('/:id', [auth, superAdminAuth], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur non trouvé' });
        }

        // Prevent deletion of SUPER_ADMIN by themselves
        if (user._id.toString() === req.user.id) {
            return res.status(403).json({ msg: 'Vous ne pouvez pas vous supprimer vous-même' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Membre du staff supprimé avec succès' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

module.exports = router;
