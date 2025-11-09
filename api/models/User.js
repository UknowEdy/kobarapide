const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    telephone: { type: String, required: true },
    pieceIdentite: { type: String, required: true },
    dateDeNaissance: { type: String, required: true },
    photoUrl: { type: String }, // Photo carte d'identité - PERSISTANT (jamais auto-supprimé)
    selfieIdUrl: { type: String }, // Selfie avec ID - TTL 30 jours
    selfieIdUploadedAt: { type: Date }, // Timestamp pour le TTL
    score: { type: Number, default: 0 },
    status: { type: String, enum: ['EN_ATTENTE', 'ACTIF', 'SUSPENDU', 'BLOQUE', 'REACTIVATION_EN_ATTENTE', 'INACTIF_EXCLU', 'EN_VERIFICATION_DOUBLON', 'REJETE'], default: 'EN_ATTENTE' },
    role: { type: String, enum: ['CLIENT', 'MODERATEUR', 'ADMIN', 'SUPER_ADMIN'], default: 'CLIENT' },
    codeParrainage: { type: String },
    parrainPar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    filleuls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dateInscription: { type: Date, default: Date.now },
    dateActivation: { type: Date },
    dateDerniereActivite: { type: Date, default: Date.now },
    nombrePretsRembourses: { type: Number, default: 0 },
    rejectionReason: { type: String },
}, { timestamps: true });

// TTL Index pour selfieIdUrl - expire après 30 jours (2592000 secondes)
UserSchema.index({ selfieIdUploadedAt: 1 }, { expireAfterSeconds: 2592000, sparse: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);
