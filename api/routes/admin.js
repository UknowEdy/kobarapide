const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const LoanApplication = require('../models/LoanApplication');
const PotentialDuplicate = require('../models/PotentialDuplicate');
const WaitingListItem = require('../models/WaitingListItem');

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
        const [
            totalClients,
            activeClients,
            pendingClients,
            totalStaff,
            totalLoans,
            activeLoans,
            pendingLoans,
            completedLoans,
            pendingDuplicates,
            waitingListCount
        ] = await Promise.all([
            User.countDocuments({ role: 'CLIENT' }),
            User.countDocuments({ role: 'CLIENT', status: 'ACTIF' }),
            User.countDocuments({ role: 'CLIENT', status: 'EN_ATTENTE' }),
            User.countDocuments({ role: { $in: ['ADMIN', 'MODERATEUR', 'SUPER_ADMIN'] } }),
            LoanApplication.countDocuments(),
            LoanApplication.countDocuments({ status: 'DEBLOQUE' }),
            LoanApplication.countDocuments({ status: 'EN_ATTENTE' }),
            LoanApplication.countDocuments({ status: 'REMBOURSE' }),
            PotentialDuplicate.countDocuments({ status: 'pending' }),
            WaitingListItem.countDocuments()
        ]);

        // Calculate total loan amount
        const loanStats = await LoanApplication.aggregate([
            { $group: { _id: null, totalAmount: { $sum: '$requestedAmount' }, totalFees: { $sum: '$fees' } } }
        ]);

        res.json({
            totalClients,
            activeClients,
            pendingClients,
            totalStaff,
            totalLoans,
            activeLoans,
            pendingLoans,
            completedLoans,
            duplicates: pendingDuplicates,
            waitingListCount,
            totalLoanAmount: loanStats[0]?.totalAmount || 0,
            totalFees: loanStats[0]?.totalFees || 0
        });
    } catch (err) {
        console.error(err.message);
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
