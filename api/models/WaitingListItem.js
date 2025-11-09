const mongoose = require('mongoose');

const WaitingListItemSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    position: { type: Number, required: true },
    hasReferralCode: { type: Boolean, default: false },
    priority: { type: Number, enum: [1, 2], default: 2 }, // 1 = referral, 2 = standard
    dateInscription: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('WaitingListItem', WaitingListItemSchema);
