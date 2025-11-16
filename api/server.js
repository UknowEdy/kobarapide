require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const loanRoutes = require('./routes/loans');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const duplicatesRoutes = require('./routes/duplicates');
const waitingListRoutes = require('./routes/waiting-list');
const capacityRoutes = require('./routes/capacity');
const maintenanceMode = require('./middleware/maintenanceMode');

const app = express();

// Middleware de base
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques (pour la page de maintenance)
app.use(express.static(path.join(__dirname, '..')));

// Connect to MongoDB
connectDB();

// Mode Maintenance (doit être AVANT les routes)
app.use(maintenanceMode);

// Health check (pour Render et monitoring)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        maintenance: process.env.MAINTENANCE_MODE === 'true'
    });
});

// Routes
app.get('/', (req, res) => {
    res.json({ message: "API Kobarapide en cours d'exécution" });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/duplicates', duplicatesRoutes);
app.use('/api/waiting-list', waitingListRoutes);
app.use('/api/capacity', capacityRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
    console.log(`🔧 Mode maintenance: ${process.env.MAINTENANCE_MODE === 'true' ? '⚠️  ACTIVÉ' : '✅ Désactivé'}`);
    console.log(`🌐 Environnement: ${process.env.NODE_ENV || 'development'}`);
});
