const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const AppConfig = require('../models/AppConfig');
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ msg: 'Refusé' });
    next();
};
const superAdminOnly = (req, res, next) => {
    if (req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ msg: 'Refusé' });
    next();
};
router.get('/stats', [auth, adminAuth], async (req, res) => {
    try {
        const totalClients = await User.countDocuments({ role: 'CLIENT' });
        const totalStaff = await User.countDocuments({ role: { $in: ['ADMIN', 'MODERATEUR', 'SUPER_ADMIN'] } });
        res.json({ totalClients, totalStaff });
    } catch (err) {
        res.status(500).send('Erreur');
    }
});
router.delete('/clear-all-users', [auth, superAdminOnly], async (req, res) => {
    try {
        const result = await User.deleteMany({});
        res.json({ msg: 'Supprimés', count: result.deletedCount });
    } catch (err) {
        res.status(500).send('Erreur');
    }
});

// GET - Vérifier l'état actuel de la maintenance
router.get('/maintenance-status', [auth, superAdminOnly], async (req, res) => {
    try {
        // Chercher la config dans la DB
        let config = await AppConfig.findOne();

        // Si pas de config, en créer une par défaut
        if (!config) {
            config = new AppConfig({ maintenanceMode: false });
            await config.save();
        }

        res.json({
            success: true,
            maintenanceMode: config.maintenanceMode,
            lastModifiedAt: config.lastModifiedAt,
            msg: config.maintenanceMode ? 'Mode maintenance activé' : 'Site en ligne'
        });
    } catch (err) {
        console.error('Erreur maintenance-status:', err.message);
        res.status(500).json({ success: false, msg: 'Erreur serveur' });
    }
});

// POST - Activer/Désactiver la maintenance
router.post('/toggle-maintenance', [auth, superAdminOnly], async (req, res) => {
    try {
        const { enable } = req.body;

        if (typeof enable !== 'boolean') {
            return res.status(400).json({ success: false, msg: 'Le paramètre "enable" doit être un booléen' });
        }

        // Chercher ou créer la config
        let config = await AppConfig.findOne();
        if (!config) {
            config = new AppConfig();
        }

        // Mettre à jour
        config.maintenanceMode = enable;
        config.lastModifiedBy = req.user.id;
        config.lastModifiedAt = Date.now();
        await config.save();

        // Mettre à jour aussi en mémoire pour effet immédiat
        process.env.MAINTENANCE_MODE = enable ? 'true' : 'false';

        console.log(`🔧 Mode maintenance ${enable ? 'ACTIVÉ' : 'DÉSACTIVÉ'} par ${req.user.email}`);

        res.json({
            success: true,
            maintenanceMode: enable,
            msg: enable
                ? '🔧 Mode maintenance activé. Les clients verront la page de maintenance.'
                : '✅ Mode maintenance désactivé. Le site est de nouveau accessible.'
        });
    } catch (err) {
        console.error('Erreur toggle-maintenance:', err.message);
        res.status(500).json({ success: false, msg: 'Erreur serveur' });
    }
});

module.exports = router;
