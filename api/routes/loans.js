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
    // Accepter les noms français OU anglais pour compatibilité frontend
    const requestedAmount = req.body.requestedAmount || req.body.montant;
    const loanPurpose = req.body.loanPurpose || req.body.raison;

    try {
        if (!requestedAmount || !loanPurpose) {
            return res.status(400).json({ msg: 'Montant et raison requis' });
        }

        // Récupérer l'utilisateur pour vérifier son score
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur non trouvé' });
        }

        // Validation : montant doit être un multiple de 5000F
        if (requestedAmount % 5000 !== 0) {
            return res.status(400).json({
                msg: 'Le montant doit être un multiple de 5 000 F'
            });
        }

        // Calculer le montant maximum selon le score
        const score = user.score || 0;
        let maxMontant = 0;

        if (score >= 0 && score <= 3) {
            maxMontant = 5000;
        } else if (score >= 4 && score <= 6) {
            maxMontant = 10000;
        } else if (score >= 7 && score <= 9) {
            maxMontant = 15000;
        } else if (score === 10) {
            maxMontant = 20000;
        }

        // Vérifier que le montant demandé ne dépasse pas le maximum autorisé
        if (requestedAmount > maxMontant) {
            return res.status(400).json({
                msg: `Votre score (${score}) permet un prêt maximum de ${maxMontant.toLocaleString()} F`
            });
        }

        // Calculer les frais de dossier et transfert (5%)
        const fees = requestedAmount * 0.05;

        // Calculer le montant net que l'utilisateur recevra
        const netAmount = requestedAmount - fees;

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
        let loans;
        if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN' || req.user.role === 'MODERATEUR') {
            // Admin/Moderateur peut filtrer par statut
            const filter = {};
            if (req.query.status) {
                filter.status = req.query.status;
            }
            loans = await LoanApplication.find(filter).populate('userId', ['prenom', 'nom']);
        } else {
            loans = await LoanApplication.find({ userId: req.user.id });
        }
        res.json(loans);
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

        // Marquer la date d'approbation
        if (status === 'APPROUVE') {
            loan.approvedAt = Date.now();
        }

        // Générer les échéances au moment du DÉBLOCAGE (quand l'argent est versé)
        if (status === 'DEBLOQUE') {
            loan.disbursedAt = Date.now();

            // Calculer les montants des 2 tranches (50% chacune)
            const installmentAmount = loan.requestedAmount / 2;
            const today = new Date();

            // Tranche 1 : 50% à 30 jours
            // Tranche 2 : 50% à 60 jours
            loan.installments = [
                {
                    installmentNumber: 1,
                    dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
                    dueAmount: installmentAmount
                },
                {
                    installmentNumber: 2,
                    dueDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000),
                    dueAmount: installmentAmount
                }
            ];
        }

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