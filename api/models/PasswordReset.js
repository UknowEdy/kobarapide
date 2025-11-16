const mongoose = require('mongoose');

const PasswordResetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resetToken: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index TTL pour supprimer automatiquement les tokens expirés après 2 heures
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 7200 });

module.exports = mongoose.model('PasswordReset', PasswordResetSchema);
