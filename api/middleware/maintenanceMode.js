/**
 * Middleware Mode Maintenance - Kobarapide
 *
 * Active/désactive le mode maintenance via variable d'environnement
 * Usage: MAINTENANCE_MODE=true pour activer
 */

const path = require('path');
const fs = require('fs');

const maintenanceMode = (req, res, next) => {
    // Vérifier si le mode maintenance est activé
    const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';

    // Si mode maintenance désactivé, continuer normalement
    if (!MAINTENANCE_MODE) {
        return next();
    }

    // Liste des chemins autorisés même en mode maintenance
    const allowedPaths = [
        '/maintenance.html',
        '/maintenance',
        '/health', // Pour les health checks Render
        '/api/health' // Pour les health checks API
    ];

    // Permettre l'accès aux fichiers statiques de la page de maintenance
    if (allowedPaths.some(path => req.path.startsWith(path))) {
        return next();
    }

    // Permettre l'accès aux admins (optionnel)
    // Décommentez si vous voulez permettre l'accès admin pendant la maintenance
    /*
    const adminToken = req.headers['x-admin-token'];
    if (adminToken === process.env.ADMIN_MAINTENANCE_TOKEN) {
        return next();
    }
    */

    // Rediriger vers la page de maintenance
    // Si c'est une requête API, renvoyer JSON
    if (req.path.startsWith('/api/')) {
        return res.status(503).json({
            status: 'maintenance',
            message: 'Le site est actuellement en maintenance. Nous serons de retour très bientôt.',
            contact: 'contactkobarapide@gmail.com'
        });
    }

    // Pour les requêtes web normales, envoyer la page HTML
    const maintenancePagePath = path.join(__dirname, '../../maintenance.html');

    // Vérifier si le fichier existe
    if (fs.existsSync(maintenancePagePath)) {
        return res.status(503).sendFile(maintenancePagePath);
    } else {
        // Fallback si le fichier n'existe pas
        return res.status(503).send(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Maintenance - Kobarapide</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: #2D2A26;
                        color: #F3F4F6;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                        text-align: center;
                    }
                    .container {
                        max-width: 600px;
                    }
                    h1 {
                        color: #D97706;
                        font-size: 32px;
                        margin-bottom: 20px;
                    }
                    p {
                        font-size: 18px;
                        line-height: 1.6;
                        margin-bottom: 15px;
                    }
                    a {
                        color: #D97706;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🔧 Maintenance en cours</h1>
                    <p>Kobarapide est actuellement en maintenance.</p>
                    <p>Nous mettons tout en œuvre pour rétablir le service dans les plus brefs délais.</p>
                    <p>Merci de votre patience.</p>
                    <p>Contact: <a href="mailto:contactkobarapide@gmail.com">contactkobarapide@gmail.com</a></p>
                </div>
            </body>
            </html>
        `);
    }
};

module.exports = maintenanceMode;
