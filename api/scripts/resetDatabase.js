/**
 * Script de Nettoyage et Réinitialisation de la Base de Données
 *
 * Ce script :
 * 1. Supprime TOUS les utilisateurs (clients, staff, admins)
 * 2. Supprime TOUTES les demandes de prêts
 * 3. Supprime les doublons potentiels
 * 4. Crée un SuperAdmin avec les identifiants définis
 *
 * ⚠️ ATTENTION : Cette opération est IRRÉVERSIBLE
 *
 * Usage :
 *   node api/scripts/resetDatabase.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const LoanApplication = require('../models/LoanApplication');
const PotentialDuplicate = require('../models/PotentialDuplicate');

// Identifiants du SuperAdmin
const SUPERADMIN_EMAIL = 'edemkukuz@gmail.com';
const SUPERADMIN_PASSWORD = 'admin123';

const resetDatabase = async () => {
    try {
        console.log('🔌 Connexion à MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connecté à MongoDB\n');

        // ========================================
        // 1. SUPPRESSION DES DONNÉES
        // ========================================

        console.log('🗑️  ÉTAPE 1 : Suppression de toutes les données...\n');

        // Supprimer tous les utilisateurs
        const deletedUsers = await User.deleteMany({});
        console.log(`   ✅ Utilisateurs supprimés : ${deletedUsers.deletedCount}`);

        // Supprimer tous les prêts
        const deletedLoans = await LoanApplication.deleteMany({});
        console.log(`   ✅ Demandes de prêts supprimées : ${deletedLoans.deletedCount}`);

        // Supprimer les doublons potentiels
        const deletedDuplicates = await PotentialDuplicate.deleteMany({});
        console.log(`   ✅ Doublons potentiels supprimés : ${deletedDuplicates.deletedCount}\n`);

        // ========================================
        // 2. CRÉATION DU SUPERADMIN
        // ========================================

        console.log('👤 ÉTAPE 2 : Création du SuperAdmin...\n');

        // Vérifier que l'email n'existe pas déjà (sécurité)
        const existingSuperAdmin = await User.findOne({ email: SUPERADMIN_EMAIL });
        if (existingSuperAdmin) {
            console.log(`   ⚠️  Un utilisateur avec l'email ${SUPERADMIN_EMAIL} existe déjà`);
            console.log('   Suppression et recréation...\n');
            await User.deleteOne({ email: SUPERADMIN_EMAIL });
        }

        // Créer le SuperAdmin
        const superAdmin = new User({
            email: SUPERADMIN_EMAIL,
            password: SUPERADMIN_PASSWORD, // Sera hashé automatiquement par le pre-save hook
            nom: 'Super',
            prenom: 'Admin',
            telephone: '0000000000',
            pieceIdentite: 'SUPERADMIN_001',
            dateDeNaissance: '1990-01-01',
            role: 'SUPER_ADMIN',
            status: 'ACTIF',
            score: 10,
            isEmailVerified: true,
            nombrePretsRembourses: 0
        });

        await superAdmin.save();

        console.log('   ✅ SuperAdmin créé avec succès :');
        console.log(`      📧 Email    : ${SUPERADMIN_EMAIL}`);
        console.log(`      🔑 Password : ${SUPERADMIN_PASSWORD}`);
        console.log(`      👑 Rôle     : SUPER_ADMIN`);
        console.log(`      ✅ Statut   : ACTIF`);
        console.log(`      ⭐ Score    : 10\n`);

        // ========================================
        // 3. RÉSUMÉ
        // ========================================

        console.log('========================================');
        console.log('✅ RÉINITIALISATION TERMINÉE\n');
        console.log('📊 Résumé :');
        console.log(`   • ${deletedUsers.deletedCount} utilisateurs supprimés`);
        console.log(`   • ${deletedLoans.deletedCount} demandes de prêts supprimées`);
        console.log(`   • ${deletedDuplicates.deletedCount} doublons supprimés`);
        console.log('   • 1 SuperAdmin créé\n');
        console.log('🔐 Connexion SuperAdmin :');
        console.log(`   Email    : ${SUPERADMIN_EMAIL}`);
        console.log(`   Password : ${SUPERADMIN_PASSWORD}\n`);
        console.log('========================================\n');

        // Fermer la connexion
        await mongoose.connection.close();
        console.log('🔌 Connexion MongoDB fermée');
        process.exit(0);

    } catch (error) {
        console.error('❌ ERREUR lors de la réinitialisation :', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Confirmation avant exécution
console.log('\n========================================');
console.log('⚠️  ATTENTION : RÉINITIALISATION DE LA BASE DE DONNÉES');
console.log('========================================\n');
console.log('Cette opération va :');
console.log('  1. Supprimer TOUS les utilisateurs');
console.log('  2. Supprimer TOUTES les demandes de prêts');
console.log('  3. Supprimer TOUS les doublons');
console.log('  4. Créer un nouveau SuperAdmin\n');
console.log('⚠️  Cette action est IRRÉVERSIBLE !\n');

// Lancer la réinitialisation après 3 secondes
console.log('🕐 Démarrage dans 3 secondes...');
console.log('   (Appuyez sur Ctrl+C pour annuler)\n');

setTimeout(() => {
    resetDatabase();
}, 3000);
