const mongoose = require('mongoose');

const PotentialDuplicateSchema = new mongoose.Schema({
    newUser: {
        email: { type: String, required: true },
        nom: { type: String, required: true },
        prenom: { type: String, required: true },
        telephone: { type: String, required: true },
        pieceIdentite: { type: String, required: true },
        dateDeNaissance: { type: String, required: true },
    },
    existingUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    resolvedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('PotentialDuplicate', PotentialDuplicateSchema);
