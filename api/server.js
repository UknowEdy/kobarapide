require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/waiting-list', require('./routes/waiting-list'));
app.use('/api/duplicates', require('./routes/duplicates'));

// Simple route for testing
app.get('/', (req, res) => res.send('API Kobarapide en cours d\'exécution'));

const PORT = process.env.PORT || 3001;

// Vercel handles the listening part when deployed as a serverless function.
// We only listen here for local development.
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Serveur local démarré sur le port ${PORT}`));
}

// Export the app for Vercel
module.exports = app;
