const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    // Nombre maximum de clients autorisés
    maxClients: {
        type: Number,
        default: 1000, // Par défaut 1000 clients
        min: 0
    },

    // Qui a modifié en dernier
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Date de dernière modification
    lastModifiedAt: {
        type: Date,
        default: Date.now
    },

    // Autres paramètres futurs peuvent être ajoutés ici
    // ex: frais de dossier par défaut, durée de prêt par défaut, etc.

}, { timestamps: true });

// On ne veut qu'un seul document de settings
// Index unique pour s'assurer qu'il n'y a qu'une seule configuration
SettingsSchema.index({ _id: 1 }, { unique: true });

module.exports = mongoose.model('Settings', SettingsSchema);
