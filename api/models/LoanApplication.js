const mongoose = require('mongoose');

const InstallmentSchema = new mongoose.Schema({
    installmentNumber: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    dueAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paidAt: { type: Date },
    status: { type: String, enum: ['EN_ATTENTE', 'PAYEE', 'EN_RETARD', 'IMPAYEE', 'EN_ATTENTE_CONFIRMATION'], default: 'EN_ATTENTE' },
    daysLate: { type: Number, default: 0 },
    warningsSent: { type: Boolean, default: false },
    paymentProofUrl: { type: String },
});

const LoanApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['EN_ATTENTE', 'APPROUVE', 'DEBLOQUE', 'REMBOURSE', 'REJETE', 'DEFAUT'], default: 'EN_ATTENTE' },
    requestedAmount: { type: Number, required: true },
    fees: { type: Number, required: true },
    netAmount: { type: Number, required: true },
    loanPurpose: { type: String, required: true },
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    validationJustification: { type: String },
    rejectionReason: { type: String },
    approvedAt: { type: Date },
    disbursedAt: { type: Date },
    completedAt: { type: Date },
    installments: [InstallmentSchema],
}, { timestamps: true });

module.exports = mongoose.model('LoanApplication', LoanApplicationSchema);