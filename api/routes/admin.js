const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
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
module.exports = router;
