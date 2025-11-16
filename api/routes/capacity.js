const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const CapacityConfig = require('../models/CapacityConfig');
const User = require('../models/User');

// Admin auth middleware
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ msg: 'Accès refusé' });
    }
    next();
};

// @route   GET api/capacity
// @desc    Get current capacity configuration
// @access  Private (Admin)
router.get('/', [auth, adminAuth], async (req, res) => {
    try {
        let config = await CapacityConfig.findOne();

        // Create default config if none exists
        if (!config) {
            config = new CapacityConfig({
                totalCapacity: 100,
                currentUsage: 0,
                autoIncrease: false,
                increaseThreshold: 90,
                increaseAmount: 20
            });
            await config.save();
        }

        // Calculate current usage (active clients)
        const activeClients = await User.countDocuments({
            role: 'CLIENT',
            status: 'ACTIF'
        });
        config.currentUsage = activeClients;
        await config.save();

        res.json(config);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   PUT api/capacity
// @desc    Update capacity configuration
// @access  Private (Admin)
router.put('/', [auth, adminAuth], async (req, res) => {
    const { totalCapacity, autoIncrease, increaseThreshold, increaseAmount } = req.body;

    try {
        let config = await CapacityConfig.findOne();

        if (!config) {
            config = new CapacityConfig();
        }

        if (totalCapacity !== undefined) config.totalCapacity = totalCapacity;
        if (autoIncrease !== undefined) config.autoIncrease = autoIncrease;
        if (increaseThreshold !== undefined) config.increaseThreshold = increaseThreshold;
        if (increaseAmount !== undefined) config.increaseAmount = increaseAmount;

        config.lastUpdated = Date.now();
        config.updatedBy = req.user.id;

        await config.save();

        res.json(config);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   GET api/capacity/check
// @desc    Check if capacity allows new activations
// @access  Private (Admin)
router.get('/check', [auth, adminAuth], async (req, res) => {
    try {
        let config = await CapacityConfig.findOne();

        if (!config) {
            return res.json({
                canActivate: true,
                available: 100,
                message: 'Aucune limite configurée'
            });
        }

        const activeClients = await User.countDocuments({
            role: 'CLIENT',
            status: 'ACTIF'
        });

        const canActivate = activeClients < config.totalCapacity;
        const available = config.totalCapacity - activeClients;
        const usagePercentage = (activeClients / config.totalCapacity * 100).toFixed(1);

        // Auto-increase if needed
        if (config.autoIncrease && usagePercentage >= config.increaseThreshold) {
            config.totalCapacity += config.increaseAmount;
            await config.save();

            return res.json({
                canActivate: true,
                available: config.totalCapacity - activeClients,
                totalCapacity: config.totalCapacity,
                currentUsage: activeClients,
                usagePercentage,
                autoIncreased: true,
                message: `Capacité augmentée automatiquement de ${config.increaseAmount}`
            });
        }

        res.json({
            canActivate,
            available,
            totalCapacity: config.totalCapacity,
            currentUsage: activeClients,
            usagePercentage,
            message: canActivate
                ? `${available} places disponibles`
                : 'Capacité maximale atteinte'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

module.exports = router;
