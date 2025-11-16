const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const { uploadIdCard, uploadSelfie, uploadPaymentProof } = require('../middleware/uploadMiddleware');

// @route   POST api/upload/id-card
// @desc    Upload ID card photo
// @access  Private
router.post('/id-card', auth, (req, res) => {
    uploadIdCard(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ msg: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'Aucun fichier téléchargé' });
        }

        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ msg: 'Utilisateur non trouvé' });
            }

            // Save the file URL (in production, this would be a cloud URL)
            user.photoUrl = `/uploads/id-cards/${req.file.filename}`;
            await user.save();

            res.json({
                msg: 'Photo de la carte d\'identité téléchargée avec succès',
                photoUrl: user.photoUrl
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Erreur du serveur');
        }
    });
});

// @route   POST api/upload/selfie
// @desc    Upload selfie with ID
// @access  Private
router.post('/selfie', auth, (req, res) => {
    uploadSelfie(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ msg: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'Aucun fichier téléchargé' });
        }

        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ msg: 'Utilisateur non trouvé' });
            }

            // Save the file URL with timestamp for TTL tracking
            user.selfieIdUrl = `/uploads/selfies/${req.file.filename}`;
            user.selfieIdUploadedAt = Date.now();
            await user.save();

            res.json({
                msg: 'Selfie avec pièce d\'identité téléchargé avec succès',
                selfieIdUrl: user.selfieIdUrl
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Erreur du serveur');
        }
    });
});

// @route   POST api/upload/payment-proof/:loanId/:installmentNumber
// @desc    Upload payment proof for installment
// @access  Private
router.post('/payment-proof/:loanId/:installmentNumber', auth, (req, res) => {
    uploadPaymentProof(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ msg: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'Aucun fichier téléchargé' });
        }

        try {
            const LoanApplication = require('../models/LoanApplication');
            const loan = await LoanApplication.findOne({
                _id: req.params.loanId,
                userId: req.user.id
            });

            if (!loan) {
                return res.status(404).json({ msg: 'Prêt non trouvé' });
            }

            const installment = loan.installments.find(
                i => i.installmentNumber == req.params.installmentNumber
            );

            if (!installment) {
                return res.status(404).json({ msg: 'Échéance non trouvée' });
            }

            // Update installment with payment proof
            installment.paymentProofUrl = `/uploads/payment-proofs/${req.file.filename}`;
            installment.status = 'EN_ATTENTE_CONFIRMATION';

            await loan.save();

            res.json({
                msg: 'Preuve de paiement téléchargée avec succès',
                paymentProofUrl: installment.paymentProofUrl,
                loan
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Erreur du serveur');
        }
    });
});

module.exports = router;
