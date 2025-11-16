require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const loanRoutes = require('./routes/loans');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const duplicatesRoutes = require('./routes/duplicates');
const waitingListRoutes = require('./routes/waiting-list');
const capacityRoutes = require('./routes/capacity');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

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
    console.log(`Serveur démarré sur le port ${PORT}`);
});
