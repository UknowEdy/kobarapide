const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const LoanApplication = require('../models/LoanApplication');

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
            const validStatuses = ['EN_ATTENTE', 'ACTIF', 'SUSPENDU', 'BLOQUE', 'REACTIVATION_EN_ATTENTE', 'INACTIF_EXCLU', 'EN_VERIFICATION_DOUBLON', 'REJETE', 'COMPTE_SUPPRIME'];
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

// @route   POST /api/users/delete-account
// @desc    Supprimer son propre compte (CLIENT uniquement)
// @access  Private (CLIENT)
router.post('/delete-account', auth, async (req, res) => {
    const { password, reason } = req.body;

    try {
        // 1. Vérifier que l'utilisateur est bien un CLIENT
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur non trouvé' });
        }

        if (user.role !== 'CLIENT') {
            return res.status(403).json({
                msg: 'Seuls les clients peuvent supprimer leur compte via cette route'
            });
        }

        // 2. Vérifier le mot de passe pour confirmer l'identité
        if (!password) {
            return res.status(400).json({
                msg: 'Mot de passe requis pour confirmer la suppression'
            });
        }

        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                msg: 'Mot de passe incorrect'
            });
        }

        // 3. Vérifier qu'il n'a aucun prêt en cours ou impayé
        const activeLoans = await LoanApplication.find({
            userId: req.user.id,
            status: { $in: ['EN_ATTENTE', 'APPROUVE', 'DEBLOQUE'] }
        });

        if (activeLoans.length > 0) {
            return res.status(400).json({
                msg: 'Impossible de supprimer votre compte. Vous avez des prêts en cours.',
                activeLoans: activeLoans.length,
                details: 'Vous devez rembourser tous vos prêts avant de pouvoir supprimer votre compte.'
            });
        }

        // 4. Vérifier les prêts non remboursés (défaut)
        const unpaidLoans = await LoanApplication.find({
            userId: req.user.id,
            status: 'DEFAUT'
        });

        if (unpaidLoans.length > 0) {
            return res.status(400).json({
                msg: 'Impossible de supprimer votre compte. Vous avez des prêts impayés.',
                unpaidLoans: unpaidLoans.length,
                details: 'Veuillez contacter le support pour régulariser votre situation : contactkobarapide@gmail.com'
            });
        }

        // 5. Marquer le compte comme SUPPRIMÉ (soft delete)
        user.status = 'COMPTE_SUPPRIME';
        user.deletionReason = reason || 'Suppression volontaire par le client';
        user.deletedAt = Date.now();

        // Anonymiser certaines données sensibles mais GARDER LA TRACE
        // On ne supprime PAS les données, on les garde pour l'audit
        user.dateDerniereActivite = Date.now();

        await user.save();

        // 6. Log pour l'audit interne
        console.log(`📋 SUPPRESSION DE COMPTE - Client ID: ${user._id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nom: ${user.prenom} ${user.nom}`);
        console.log(`   Raison: ${user.deletionReason}`);
        console.log(`   Date: ${new Date().toISOString()}`);
        console.log(`   Prêts remboursés: ${user.nombrePretsRembourses}`);

        res.json({
            msg: 'Votre compte a été supprimé avec succès.',
            details: 'Vos données ont été archivées conformément à nos obligations légales. Merci d\'avoir utilisé Kobarapide.'
        });

    } catch (err) {
        console.error('Erreur lors de la suppression de compte:', err.message);
        res.status(500).send('Erreur serveur');
    }
});

// @route   GET /api/users/deleted
// @desc    Voir les comptes supprimés (ADMIN uniquement)
// @access  Private (ADMIN)
router.get('/deleted', [auth, adminAuth], async (req, res) => {
    try {
        const deletedUsers = await User.find({
            status: 'COMPTE_SUPPRIME'
        }).select('-password').sort({ deletedAt: -1 });

        res.json({
            total: deletedUsers.length,
            users: deletedUsers
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
