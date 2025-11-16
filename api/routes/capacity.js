const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const CapacityConfig = require('../models/CapacityConfig');
const User = require('../models/User');

// Middleware pour vérifier que l'utilisateur est ADMIN ou SUPER_ADMIN
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ msg: 'Accès refusé. Admin requis.' });
    }
    next();
};

// @route   GET /api/capacity
// @desc    Récupère la configuration de capacité
// @access  Public (pour vérifier lors de l'inscription)
router.get('/', async (req, res) => {
    try {
        let config = await CapacityConfig.findOne();

        // Si aucune config n'existe, créer une par défaut
        if (!config) {
            config = new CapacityConfig({
                totalCapacity: 100,
                currentActiveUsers: 0,
                isCapacityEnabled: true
            });
            await config.save();
        }

        // Compter les utilisateurs actifs réels
        const activeUsersCount = await User.countDocuments({ status: 'ACTIF' });
        config.currentActiveUsers = activeUsersCount;
        await config.save();

        res.json(config);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   PUT /api/capacity
// @desc    Met à jour la configuration de capacité
// @access  Private (ADMIN ou SUPER_ADMIN uniquement)
router.put('/', [auth, requireAdmin], async (req, res) => {
    const { totalCapacity, isCapacityEnabled } = req.body;

    try {
        let config = await CapacityConfig.findOne();

        if (!config) {
            config = new CapacityConfig({
                totalCapacity: totalCapacity || 100,
                isCapacityEnabled: isCapacityEnabled !== undefined ? isCapacityEnabled : true,
                lastModifiedBy: req.user.id
            });
        } else {
            if (totalCapacity !== undefined) config.totalCapacity = totalCapacity;
            if (isCapacityEnabled !== undefined) config.isCapacityEnabled = isCapacityEnabled;
            config.lastModifiedBy = req.user.id;
        }

        // Mettre à jour le compteur d'utilisateurs actifs
        const activeUsersCount = await User.countDocuments({ status: 'ACTIF' });
        config.currentActiveUsers = activeUsersCount;

        await config.save();

        res.json({ msg: 'Configuration mise à jour', config });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   GET /api/capacity/check
// @desc    Vérifie si on peut activer de nouveaux utilisateurs
// @access  Public
router.get('/check', async (req, res) => {
    try {
        let config = await CapacityConfig.findOne();

        if (!config) {
            config = new CapacityConfig({
                totalCapacity: 100,
                currentActiveUsers: 0,
                isCapacityEnabled: true
            });
            await config.save();
        }

        // Compter les utilisateurs actifs réels
        const activeUsersCount = await User.countDocuments({ status: 'ACTIF' });
        config.currentActiveUsers = activeUsersCount;
        await config.save();

        const canActivate = config.isCapacityEnabled && (config.currentActiveUsers < config.totalCapacity);

        res.json({
            canActivate,
            currentActiveUsers: config.currentActiveUsers,
            totalCapacity: config.totalCapacity,
            isCapacityEnabled: config.isCapacityEnabled,
            availableSlots: config.totalCapacity - config.currentActiveUsers
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

module.exports = router;
