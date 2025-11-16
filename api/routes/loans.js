const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const LoanApplication = require('../models/LoanApplication');
const User = require('../models/User');

const adminAuth = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ msg: 'Accès refusé.' });
    }
    next();
};

// @route   POST api/loans
// @desc    Create a loan application
// @access  Private
router.post('/', auth, async (req, res) => {
    const { requestedAmount, loanPurpose } = req.body;
    
    try {
        const fees = requestedAmount * 0.1; // 10%
        const netAmount = requestedAmount * 1.1;

        const newLoan = new LoanApplication({
            userId: req.user.id,
            requestedAmount,
            loanPurpose,
            fees,
            netAmount,
        });

        const loan = await newLoan.save();
        res.json(loan);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   GET api/loans
// @desc    Get all loans (for admin) or user's loans
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { status, userId } = req.query;
        let query = {};

        if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
            // Admin can filter by status and userId
            if (status) query.status = status;
            if (userId) query.userId = userId;
        } else {
            // Regular users can only see their own loans
            query.userId = req.user.id;
        }

        const loans = await LoanApplication.find(query).populate('userId', ['prenom', 'nom', 'email']);
        res.json(loans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   POST api/loans/:id/approve
// @desc    Approve a loan application
// @access  Private (Admin)
router.post('/:id/approve', [auth, adminAuth], async (req, res) => {
    try {
        const loan = await LoanApplication.findById(req.params.id);
        if (!loan) return res.status(404).json({ msg: 'Prêt non trouvé' });

        if (loan.status !== 'EN_ATTENTE') {
            return res.status(400).json({ msg: 'Ce prêt ne peut pas être approuvé' });
        }

        loan.status = 'APPROUVE';
        loan.approvedAt = Date.now();
        loan.validatedBy = req.user.id;

        // Generate installments (2 payments)
        const installmentAmount = loan.netAmount / 2;
        const today = new Date();
        loan.installments = [
            {
                installmentNumber: 1,
                dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
                dueAmount: installmentAmount,
                status: 'EN_ATTENTE'
            },
            {
                installmentNumber: 2,
                dueDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000),
                dueAmount: installmentAmount,
                status: 'EN_ATTENTE'
            }
        ];

        await loan.save();
        res.json(loan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   PUT api/loans/:id/status
// @desc    Update loan status (for admin)
// @access  Private (Admin)
router.put('/:id/status', [auth, adminAuth], async (req, res) => {
    const { status, reason } = req.body;
    try {
        const loan = await LoanApplication.findById(req.params.id);
        if (!loan) return res.status(404).json({ msg: 'Prêt non trouvé' });

        loan.status = status;
        if (reason) loan.rejectionReason = reason;

        if (status === 'DEBLOQUE') loan.disbursedAt = Date.now();

        await loan.save();
        res.json(loan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   PUT api/loans/:loanId/installments/:instNum/proof
// @desc    Client submits payment proof
// @access  Private
router.put('/:loanId/installments/:instNum/proof', auth, async (req, res) => {
    const { paymentProofUrl } = req.body;
    try {
        const loan = await LoanApplication.findOne({ _id: req.params.loanId, userId: req.user.id });
        if (!loan) return res.status(404).json({ msg: 'Prêt non trouvé' });
        
        const installment = loan.installments.find(i => i.installmentNumber == req.params.instNum);
        if (!installment) return res.status(404).json({ msg: 'Échéance non trouvée' });

        installment.paymentProofUrl = paymentProofUrl;
        installment.status = 'EN_ATTENTE_CONFIRMATION';
        
        await loan.save();
        res.json(loan);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});


// @route   PUT api/loans/:loanId/installments/:instNum/confirm
// @desc    Admin confirms payment
// @access  Private (Admin)
router.put('/:loanId/installments/:instNum/confirm', [auth, adminAuth], async (req, res) => {
    try {
        const loan = await LoanApplication.findById(req.params.loanId);
        if (!loan) return res.status(404).json({ msg: 'Prêt non trouvé' });
        
        const installment = loan.installments.find(i => i.installmentNumber == req.params.instNum);
        if (!installment) return res.status(404).json({ msg: 'Échéance non trouvée' });
        
        installment.status = 'PAYEE';
        installment.paidAmount = installment.dueAmount;
        installment.paidAt = Date.now();
        
        // Check if all installments are paid
        const allPaid = loan.installments.every(i => i.status === 'PAYEE');
        if (allPaid) {
            loan.status = 'REMBOURSE';
            loan.completedAt = Date.now();

            const user = await User.findById(loan.userId);
            if (user) {
                user.nombrePretsRembourses += 1;
                if (user.nombrePretsRembourses === 1 && !user.codeParrainage) {
                    user.codeParrainage = `${user.prenom.toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
                }
                await user.save();
            }
        }
        
        await loan.save();
        res.json(loan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});


module.exports = router;