const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
// We would have a Capacity model for this in a real app
// For now, we simulate it.

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


module.exports = router;
