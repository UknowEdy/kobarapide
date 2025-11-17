const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const AppConfig = require('../models/AppConfig');
const Settings = require('../models/Settings');
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
// ADMIN et SUPER_ADMIN peuvent voir le statut
router.get('/maintenance-status', [auth, adminAuth], async (req, res) => {
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
// ADMIN et SUPER_ADMIN peuvent activer/désactiver
router.post('/toggle-maintenance', [auth, adminAuth], async (req, res) => {
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

// ========================================
// ROUTES SETTINGS (Paramètres Système)
// ========================================

// @route   GET /api/admin/settings
// @desc    Récupérer les paramètres système
// @access  Private (ADMIN et SUPER_ADMIN)
router.get('/settings', [auth, adminAuth], async (req, res) => {
    try {
        let settings = await Settings.findOne();

        // Si aucun settings n'existe, créer un par défaut
        if (!settings) {
            settings = new Settings({
                maxClients: 1000,
                lastModifiedBy: req.user.id,
                lastModifiedAt: Date.now()
            });
            await settings.save();
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (err) {
        console.error('Erreur GET settings:', err.message);
        res.status(500).json({ success: false, msg: 'Erreur serveur' });
    }
});

// @route   PUT /api/admin/settings
// @desc    Mettre à jour les paramètres système
// @access  Private (ADMIN et SUPER_ADMIN)
router.put('/settings', [auth, adminAuth], async (req, res) => {
    try {
        const { maxClients } = req.body;

        console.log('\n⚙️ ===== MISE À JOUR SETTINGS =====');
        console.log('👤 Modifié par:', req.user.email);
        console.log('📊 Nouvelle limite clients:', maxClients);

        // Validation
        if (maxClients !== undefined && (maxClients < 0 || !Number.isInteger(maxClients))) {
            return res.status(400).json({
                success: false,
                msg: 'Le nombre de clients doit être un entier positif'
            });
        }

        // Trouver ou créer les settings
        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings({
                maxClients: maxClients || 1000,
                lastModifiedBy: req.user.id,
                lastModifiedAt: Date.now()
            });
        } else {
            if (maxClients !== undefined) settings.maxClients = maxClients;
            settings.lastModifiedBy = req.user.id;
            settings.lastModifiedAt = Date.now();
        }

        await settings.save();

        console.log('✅ Settings mis à jour avec succès');
        console.log('====================================\n');

        res.json({
            success: true,
            msg: 'Paramètres mis à jour avec succès',
            data: settings
        });
    } catch (err) {
        console.error('❌ Erreur PUT settings:', err.message);
        console.log('====================================\n');
        res.status(500).json({ success: false, msg: 'Erreur serveur' });
    }
});

// @route   GET /api/admin/clients-count
// @desc    Compter le nombre de clients actuels
// @access  Private (ADMIN et SUPER_ADMIN)
router.get('/clients-count', [auth, adminAuth], async (req, res) => {
    try {
        const clientsCount = await User.countDocuments({
            role: 'CLIENT',
            status: { $ne: 'COMPTE_SUPPRIME' } // Ne pas compter les comptes supprimés
        });

        const settings = await Settings.findOne();
        const maxClients = settings ? settings.maxClients : 1000;

        res.json({
            success: true,
            data: {
                current: clientsCount,
                max: maxClients,
                available: Math.max(0, maxClients - clientsCount),
                percentage: maxClients > 0 ? Math.round((clientsCount / maxClients) * 100) : 0
            }
        });
    } catch (err) {
        console.error('Erreur clients-count:', err.message);
        res.status(500).json({ success: false, msg: 'Erreur serveur' });
    }
});

// ========================================
// ROUTES CRÉATION MANUELLE DE CLIENTS
// ========================================

// @route   POST /api/admin/create-client
// @desc    Créer manuellement un client (par ADMIN ou SUPER_ADMIN)
// @access  Private (ADMIN et SUPER_ADMIN)
router.post('/create-client', [auth, adminAuth], async (req, res) => {
    try {
        const {
            email,
            nom,
            prenom,
            telephone,
            pieceIdentite,
            dateDeNaissance,
            photoUrl,
            selfieIdUrl
        } = req.body;

        console.log('\n👥 ===== CRÉATION MANUELLE DE CLIENT =====');
        console.log('👤 Créé par:', req.user.email);
        console.log('📧 Email client:', email);

        // Validation des champs requis
        if (!email || !nom || !prenom || !telephone || !pieceIdentite || !dateDeNaissance) {
            return res.status(400).json({
                success: false,
                msg: 'Tous les champs obligatoires doivent être remplis'
            });
        }

        // Vérifier la limite de clients
        const settings = await Settings.findOne();
        const maxClients = settings ? settings.maxClients : 1000;

        const currentClientsCount = await User.countDocuments({
            role: 'CLIENT',
            status: { $ne: 'COMPTE_SUPPRIME' }
        });

        if (currentClientsCount >= maxClients) {
            console.log('❌ Limite de clients atteinte:', currentClientsCount, '/', maxClients);
            return res.status(400).json({
                success: false,
                msg: `Limite de clients atteinte (${maxClients}). Augmentez la limite dans les paramètres.`
            });
        }

        // Vérifier que l'email n'existe pas déjà
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log('❌ Email déjà utilisé:', email);
            return res.status(400).json({
                success: false,
                msg: 'Un compte avec cet email existe déjà'
            });
        }

        // Générer un mot de passe sécurisé aléatoire
        const crypto = require('crypto');
        const password = crypto.randomBytes(8).toString('hex'); // 16 caractères hexadécimaux

        // Créer le nouveau client
        const newClient = new User({
            email: email.toLowerCase(),
            password, // Sera hashé automatiquement par le pre-save hook
            nom,
            prenom,
            telephone,
            pieceIdentite,
            dateDeNaissance,
            photoUrl: photoUrl || '',
            selfieIdUrl: selfieIdUrl || '',
            selfieIdUploadedAt: selfieIdUrl ? Date.now() : null,
            role: 'CLIENT',
            status: 'ACTIF', // Directement actif car créé par un admin
            score: 0,
            isEmailVerified: true, // Considéré comme vérifié car créé par admin
            dateInscription: Date.now(),
            dateActivation: Date.now()
        });

        await newClient.save();

        console.log('✅ Client créé avec succès, ID:', newClient._id);
        console.log('🔑 Mot de passe généré:', password);
        console.log('====================================\n');

        // Retourner le client ET le mot de passe (à afficher une seule fois)
        const clientResponse = newClient.toObject();
        delete clientResponse.password; // On ne retourne jamais le hash

        res.status(201).json({
            success: true,
            msg: 'Client créé avec succès',
            data: {
                client: clientResponse,
                temporaryPassword: password // À afficher UNE SEULE FOIS à l'admin
            }
        });

    } catch (err) {
        console.error('❌ Erreur création client:', err.message);
        console.log('====================================\n');
        res.status(500).json({
            success: false,
            msg: 'Erreur serveur lors de la création du client'
        });
    }
});

module.exports = router;
