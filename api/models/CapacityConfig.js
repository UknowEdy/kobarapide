const mongoose = require('mongoose');

const CapacityConfigSchema = new mongoose.Schema({
    totalCapacity: { type: Number, required: true, default: 100 },
    currentActiveUsers: { type: Number, default: 0 },
    isCapacityEnabled: { type: Boolean, default: true },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('CapacityConfig', CapacityConfigSchema);
