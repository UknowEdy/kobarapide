const mongoose = require('mongoose');

const CapacityConfigSchema = new mongoose.Schema({
    totalCapacity: { type: Number, required: true, default: 100 },
    currentUsage: { type: Number, default: 0 },
    autoIncrease: { type: Boolean, default: false },
    increaseThreshold: { type: Number, default: 90 }, // % threshold to auto-increase
    increaseAmount: { type: Number, default: 20 }, // Amount to increase by
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Ensure only one config exists
CapacityConfigSchema.index({ _id: 1 }, { unique: true });

module.exports = mongoose.model('CapacityConfig', CapacityConfigSchema);
