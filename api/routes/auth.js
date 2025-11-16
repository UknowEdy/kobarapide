const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const PotentialDuplicate = require('../models/PotentialDuplicate');
const CapacityConfig = require('../models/CapacityConfig');

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

        // Vérifier si l'email existe déjà (quel que soit le rôle)
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Cet email est déjà utilisé dans le système' });
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

        // Vérifier la capacité pour définir le statut initial
        let capacity = await CapacityConfig.findOne();
        if (!capacity) {
            // Créer une config par défaut si elle n'existe pas
            capacity = new CapacityConfig({
                totalCapacity: 100,
                currentActiveUsers: 0,
                isCapacityEnabled: true
            });
            await capacity.save();
        }

        // Compter les utilisateurs actifs
        const activeUsersCount = await User.countDocuments({ status: 'ACTIF' });

        // Déterminer le statut initial selon la capacité
        let initialStatus = 'EN_ATTENTE';
        if (capacity.isCapacityEnabled && activeUsersCount < capacity.totalCapacity) {
            initialStatus = 'ACTIF';
        }

        user = new User({
            email,
            password,
            nom,
            prenom,
            telephone,
            pieceIdentite,
            dateDeNaissance,
            role: 'CLIENT',
            status: initialStatus,
            score: 0,
            parrainPar: parrain ? parrain._id : undefined
        });

        await user.save();

        if (parrain) {
            parrain.filleuls.push(user._id);
            await parrain.save();
        }

        // Générer un token JWT pour connexion immédiate
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

            const message = initialStatus === 'ACTIF'
                ? 'Inscription réussie! Votre compte est actif.'
                : 'Inscription réussie! Votre compte est en attente d\'activation (capacité pleine).';

            res.status(201).json({
                msg: message,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    nom: user.nom,
                    prenom: user.prenom,
                    role: user.role,
                    status: user.status,
                    score: user.score
                }
            });
        });

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

// @route   POST api/auth/init-super-admin
// @desc    Crée le premier SUPER_ADMIN (fonctionne UNIQUEMENT si aucun SUPER_ADMIN n'existe)
// @access  Public (mais sécurisé par vérification d'existence)
router.post('/init-super-admin', async (req, res) => {
    try {
        // 1. Vérifier qu'AUCUN utilisateur avec role SUPER_ADMIN n'existe
        const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });

        if (existingSuperAdmin) {
            return res.status(403).json({ msg: 'Un Super Admin existe déjà. Cet endpoint est désactivé.' });
        }

        // 2. Récupérer les données depuis le body OU depuis les variables d'environnement
        const {
            email = process.env.ADMIN_EMAIL,
            password = process.env.ADMIN_PASSWORD,
            nom = 'Super',
            prenom = 'Admin',
            telephone = '0000000000',
            pieceIdentite = 'SUPER_ADMIN_001',
            dateDeNaissance = '1990-01-01'
        } = req.body;

        // 3. Validation
        if (!email || !password) {
            return res.status(400).json({
                msg: 'Email et mot de passe requis (soit dans le body, soit dans les variables d\'environnement)'
            });
        }

        // 4. Créer le SUPER_ADMIN
        const superAdmin = new User({
            email,
            password, // Sera hashé automatiquement par le pre-save hook
            nom,
            prenom,
            telephone,
            pieceIdentite,
            dateDeNaissance,
            role: 'SUPER_ADMIN',
            status: 'ACTIF',
            score: 99,
            isEmailVerified: true
        });

        await superAdmin.save();

        // 5. Générer un token pour connexion immédiate
        const payload = {
            user: {
                id: superAdmin.id,
                role: superAdmin.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: 36000
        }, (err, token) => {
            if (err) throw err;
            res.json({
                msg: 'Super Admin créé avec succès',
                token,
                user: {
                    id: superAdmin.id,
                    email: superAdmin.email,
                    nom: superAdmin.nom,
                    prenom: superAdmin.prenom,
                    role: superAdmin.role,
                    status: superAdmin.status
                }
            });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

module.exports = router;

