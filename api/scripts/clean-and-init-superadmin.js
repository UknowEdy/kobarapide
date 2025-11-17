/**
 * Script de Nettoyage Complet et Initialisation Super Admin
 *
 * Ce script :
 * 1. Supprime TOUTES les données (users, loans, duplicates, waiting list)
 * 2. Crée 3 comptes initiaux : SUPER_ADMIN, MODERATEUR, CLIENT TEST
 * 3. Affiche les identifiants créés
 *
 * ⚠️ ATTENTION : Cette opération est IRRÉVERSIBLE
 *
 * Usage :
 *   cd api
 *   npm run clean-db
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const LoanApplication = require('../models/LoanApplication');
const PotentialDuplicate = require('../models/PotentialDuplicate');

// CONFIGURATION DES COMPTES INITIAUX
const ACCOUNTS_CONFIG = [
  // 1. SUPER ADMIN
  {
    email: 'edemkukuz+admin@gmail.com',
    password: 'KobaAdmin2025!',
    nom: 'Administrateur',
    prenom: 'Système',
    telephone: '+22500000000',
    pieceIdentite: 'ADMIN-001',
    dateDeNaissance: new Date('1990-01-01'),
    role: 'SUPER_ADMIN',
    score: 10,
    status: 'ACTIF',
    isEmailVerified: true
  },
  // 2. MODÉRATEUR (Support)
  {
    email: 'edemkukuz+support@gmail.com',
    password: 'Support2025!',
    nom: 'Support',
    prenom: 'KobaRapide',
    telephone: '+22500000001',
    pieceIdentite: 'SUPPORT-001',
    dateDeNaissance: new Date('1995-01-01'),
    role: 'MODERATEUR',
    score: 10,
    status: 'ACTIF',
    isEmailVerified: true
  },
  // 3. CLIENT TEST
  {
    email: 'edemkukuz+test@gmail.com',
    password: 'TestClient123!',
    nom: 'Client',
    prenom: 'Test',
    telephone: '+22500000002',
    pieceIdentite: 'TEST-001',
    dateDeNaissance: new Date('2000-01-01'),
    role: 'CLIENT',
    score: 0,
    status: 'ACTIF',
    isEmailVerified: true
  }
];

async function cleanAndInitialize() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // ============================================
    // ÉTAPE 1 : SUPPRIMER TOUTES LES DONNÉES
    // ============================================

    console.log('🗑️  NETTOYAGE COMPLET DE LA BASE DE DONNÉES...\n');

    // Supprimer tous les utilisateurs
    const deletedUsers = await User.deleteMany({});
    console.log(`✅ ${deletedUsers.deletedCount} utilisateurs supprimés`);

    // Supprimer tous les prêts
    const deletedLoans = await LoanApplication.deleteMany({});
    console.log(`✅ ${deletedLoans.deletedCount} prêts supprimés`);

    // Supprimer tous les doublons
    const deletedDuplicates = await PotentialDuplicate.deleteMany({});
    console.log(`✅ ${deletedDuplicates.deletedCount} doublons supprimés`);

    console.log('\n✅ BASE DE DONNÉES COMPLÈTEMENT NETTOYÉE\n');

    // ============================================
    // ÉTAPE 2 : CRÉER LES COMPTES INITIAUX
    // ============================================

    console.log('👤 CRÉATION DES COMPTES INITIAUX...\n');

    const createdAccounts = [];

    for (const accountConfig of ACCOUNTS_CONFIG) {
      // Hash du mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(accountConfig.password, salt);

      // Créer le compte
      const account = new User({
        email: accountConfig.email,
        password: hashedPassword,
        nom: accountConfig.nom,
        prenom: accountConfig.prenom,
        telephone: accountConfig.telephone,
        pieceIdentite: accountConfig.pieceIdentite,
        dateDeNaissance: accountConfig.dateDeNaissance,
        role: accountConfig.role,
        score: accountConfig.score,
        status: accountConfig.status,
        isEmailVerified: accountConfig.isEmailVerified
      });

      await account.save();
      createdAccounts.push(accountConfig);

      console.log(`✅ ${accountConfig.role} créé : ${accountConfig.email}`);
    }

    console.log('\n✅ TOUS LES COMPTES CRÉÉS AVEC SUCCÈS !\n');

    // ============================================
    // ÉTAPE 3 : AFFICHER LES IDENTIFIANTS
    // ============================================

    console.log('═══════════════════════════════════════════');
    console.log('🔑 IDENTIFIANTS DES COMPTES CRÉÉS');
    console.log('═══════════════════════════════════════════\n');

    createdAccounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.role}`);
      console.log(`   Email    : ${account.email}`);
      console.log(`   Password : ${account.password}`);
      console.log(`   Score    : ${account.score}/10`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════\n');

    // ============================================
    // ÉTAPE 4 : VÉRIFICATION
    // ============================================

    console.log('🔍 VÉRIFICATION DE LA BASE DE DONNÉES...\n');

    const totalUsers = await User.countDocuments();
    const totalLoans = await LoanApplication.countDocuments();
    const totalDuplicates = await PotentialDuplicate.countDocuments();

    console.log(`📊 État de la base :
    - Utilisateurs : ${totalUsers} (devrait être 3)
    - Prêts : ${totalLoans} (devrait être 0)
    - Doublons : ${totalDuplicates} (devrait être 0)
    `);

    if (totalUsers === 3 && totalLoans === 0 && totalDuplicates === 0) {
      console.log('✅ Base de données propre et prête !');
    } else {
      console.log(`⚠️  Attention : Données inattendues !`);
    }

    console.log('\n✅ PROCESSUS TERMINÉ AVEC SUCCÈS !');
    console.log('\n💡 Vous pouvez maintenant vous connecter avec les identifiants ci-dessus.\n');

  } catch (error) {
    console.error('❌ ERREUR :', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
}

// Exécuter le script
cleanAndInitialize();
