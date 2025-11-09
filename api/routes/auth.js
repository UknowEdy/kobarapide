const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const PotentialDuplicate = require('../models/PotentialDuplicate');

// Fonction pour normaliser les téléphones (enlever espaces, tirets, etc.)
const normalizePhone = (phone) => {
    return phone.replace(/[\s\-\.\(\)]/g, '');
};

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
    let { email, password, nom, prenom, telephone, pieceIdentite, dateDeNaissance, referralCode } = req.body;

    try {
        // NORMALISER LE TÉLÉPHONE
        telephone = normalizePhone(telephone);

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Un utilisateur avec cet email existe déjà' });
        }

        // DÉTECTION DE DOUBLONS
        const duplicateByIdentity = await User.findOne({
            nom: { $regex: nom, $options: 'i' },
            prenom: { $regex: prenom, $options: 'i' },
            dateDeNaissance: dateDeNaissance
        });

        const duplicateByPhone = await User.findOne({ 
            telephone: normalizePhone(telephone) 
        });
        
        const duplicateByPiece = await User.findOne({ 
            pieceIdentite: { $regex: pieceIdentite, $options: 'i' } 
        });

        if (duplicateByIdentity || duplicateByPhone || duplicateByPiece) {
            const existingUser = duplicateByIdentity || duplicateByPhone || duplicateByPiece;
            
            let reason = '';
            if (duplicateByIdentity) reason = 'Nom, prénom et date de naissance similaires.';
            if (duplicateByPhone) reason = 'Numéro de téléphone identique.';
            if (duplicateByPiece) reason = 'Numéro de pièce d\'identité identique.';

            // Créer un PotentialDuplicate
            const potentialDuplicate = new PotentialDuplicate({
                newUser: {
                    email,
                    nom,
                    prenom,
                    telephone,
                    pieceIdentite,
                    dateDeNaissance,
                },
                existingUser: existingUser._id,
                reason,
                status: 'pending',
            });

            await potentialDuplicate.save();

            // NE PAS CRÉER LE USER - RETOURNER UNE ERREUR
            return res.status(400).json({ 
                msg: 'Votre inscription a été reçue et est en cours de vérification en raison de similarités avec un compte existant.',
                duplicateId: potentialDuplicate._id 
            });
        }

        // Handle referral logic
        let parrain;
        if (referralCode) {
            parrain = await User.findOne({ codeParrainage: referralCode });
            if (!parrain) {
                return res.status(400).json({ msg: 'Code de parrainage invalide.' });
            }
            if (parrain.filleuls.length >= 3) {
                return res.status(400).json({ msg: 'Le parrain a atteint sa limite de 3 filleuls.' });
            }
        }

        user = new User({
            email, password, nom, prenom, telephone, pieceIdentite, dateDeNaissance,
            parrainPar: parrain ? parrain._id : undefined
        });

        await user.save();

        if (parrain) {
            parrain.filleuls.push(user._id);
            await parrain.save();
        }

        res.status(201).json({ msg: 'Inscription réussie! Veuillez attendre la validation.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Identifiants invalides' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Identifiants invalides' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: 36000
        }, (err, token) => {
            if (err) throw err;
            res.json({ token, user });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

module.exports = router;

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur non trouvé' });
        }
        res.json({ user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

