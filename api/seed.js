require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const User = require('./models/User');
const LoanApplication = require('./models/LoanApplication');
const WaitingListItem = require('./models/WaitingListItem');
const connectDB = require('./config/db');

connectDB();

const seedDatabase = async () => {
    try {
        console.log('🌱 Début du seed CONTRÔLÉ...');
        
        await User.deleteMany({});
        await LoanApplication.deleteMany({});
        await WaitingListItem.deleteMany({});
        console.log('🗑️  Collections vidées');
        
        // 1️⃣ CRÉER 1 SUPER_ADMIN
        const superAdmin = new User({
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            nom: 'Uknow',
            prenom: 'Edy',
            telephone: '0700000000',
            pieceIdentite: 'SUPER_ADMIN_001',
            dateDeNaissance: '1980-01-01',
            score: 99,
            status: 'ACTIF',
            role: 'SUPER_ADMIN',
            isEmailVerified: true,
        });
        await superAdmin.save();
        console.log(`✅ 1 SUPER_ADMIN créé`);
        
        // 2️⃣ CRÉER 5 ADMIN NORMAUX
        const admins = [];
        for (let i = 1; i <= 5; i++) {
            const admin = new User({
                email: `admin${i}@kobarapide.com`,
                password: 'admin_password_123',
                nom: `Admin${i}`,
                prenom: `Staff`,
                telephone: `070000000${i}`,
                pieceIdentite: `ADMIN_${i}`,
                dateDeNaissance: '1985-01-01',
                score: 99,
                status: 'ACTIF',
                role: 'ADMIN',
                isEmailVerified: true,
            });
            await admin.save();
            admins.push(admin);
        }
        console.log(`✅ 5 ADMIN créés`);
        
        // 3️⃣ CRÉER 10 MODÉRATEURS
        const moderators = [];
        for (let i = 1; i <= 10; i++) {
            const mod = new User({
                email: `moderateur${i}@kobarapide.com`,
                password: 'moderateur_password_123',
                nom: `Moderateur${i}`,
                prenom: `Staff`,
                telephone: `071000000${i}`,
                pieceIdentite: `MOD_${i}`,
                dateDeNaissance: '1988-01-01',
                score: 99,
                status: 'ACTIF',
                role: 'MODERATEUR',
                isEmailVerified: true,
            });
            await mod.save();
            moderators.push(mod);
        }
        console.log(`✅ 10 MODÉRATEURS créés`);
        
        // 4️⃣ CRÉER 500 CLIENTS AVEC DONNÉES PRÉVISIBLES
        const clients = [];
        const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Luc', 'Claire', 'Thomas', 'Isabelle', 'Marc', 'Nathalie'];
        const lastNames = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Robert', 'Petit', 'Durand', 'Lefevre', 'Michel', 'Garcia'];
        
        for (let i = 1; i <= 500; i++) {
            const firstName = firstNames[(i - 1) % firstNames.length];
            const lastName = lastNames[Math.floor((i - 1) / firstNames.length) % lastNames.length];
            
            const client = new User({
                email: `client${i}@example.com`,
                password: 'password123',
                nom: lastName,
                prenom: firstName,
                telephone: `06${String(i).padStart(8, '0')}`,
                pieceIdentite: `ID${String(i).padStart(6, '0')}`,
                dateDeNaissance: '1990-01-01',
                score: Math.floor(Math.random() * 11) - 3,
                status: ['EN_ATTENTE', 'ACTIF', 'SUSPENDU'][Math.floor(Math.random() * 3)],
                role: 'CLIENT',
                isEmailVerified: Math.random() > 0.3,
            });
            await client.save();
            clients.push(client);
        }
        console.log(`✅ 500 CLIENTS créés`);
        
        // 5️⃣ CRÉER QUELQUES PRÊTS
        for (let i = 0; i < 100; i++) {
            const randomClient = clients[Math.floor(Math.random() * clients.length)];
            const amount = [5000, 10000, 15000, 20000][Math.floor(Math.random() * 4)];
            
            const loan = new LoanApplication({
                userId: randomClient._id,
                status: ['EN_ATTENTE', 'APPROUVE', 'DEBLOQUE'][Math.floor(Math.random() * 3)],
                requestedAmount: amount,
                fees: amount * 0.1,
                netAmount: amount * 1.1,
                loanPurpose: 'Test',
                installments: [],
            });
            await loan.save();
        }
        console.log(`✅ 100 prêts créés`);
        
        console.log('\n🎉 Seed CONTRÔLÉ terminé !');
        console.log('\n📊 Statistiques finales:');
        console.log('   - 1 SUPER_ADMIN');
        console.log('   - 5 ADMIN');
        console.log('   - 10 MODÉRATEURS');
        console.log('   - 500 CLIENTS');
        console.log('   - 100 PRÊTS');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur:', err.message);
        process.exit(1);
    }
};

seedDatabase();
