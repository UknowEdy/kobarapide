const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

// Middleware to check for Admin roles
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ msg: 'Accès refusé. Rôle administrateur requis.' });
    }
    next();
};

// This is a placeholder for capacity settings
let capacityConfig = {
    totalCapacity: 700,
    autoIncrease: true,
};

// @route   GET api/admin/capacity
// @desc    Get capacity config
// @access  Private (Admin)
router.get('/capacity', [auth, adminAuth], (req, res) => {
    res.json(capacityConfig);
});

// @route   POST api/admin/capacity
// @desc    Update capacity config
// @access  Private (Admin)
router.post('/capacity', [auth, adminAuth], (req, res) => {
    const { totalCapacity, autoIncrease } = req.body;
    capacityConfig = { totalCapacity, autoIncrease };
    res.json(capacityConfig);
});

// @route   GET api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/stats', [auth, adminAuth], async (req, res) => {
    try {
        const User = require('../models/User');
        const LoanApplication = require('../models/LoanApplication');
        const PotentialDuplicate = require('../models/PotentialDuplicate');

        const totalClients = await User.countDocuments({ role: 'CLIENT' });
        const activeLoans = await LoanApplication.countDocuments({ status: 'ACTIVE' });
        const pendingLoans = await LoanApplication.countDocuments({ status: 'PENDING' });
        const duplicates = await PotentialDuplicate.countDocuments({ status: 'pending' });

        res.json({
            totalClients,
            activeLoans,
            pendingLoans,
            duplicates,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

module.exports = router;
