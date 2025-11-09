import React, { useState } from 'react';
import { LoanApplication, Installment, InstallmentStatus } from '../../types';
import { INSTALLMENT_STATUS_CONFIG } from '../../constants';
import StatusBadge from '../shared/StatusBadge';
import PaymentProofModal from './PaymentProofModal';

interface PaymentModalProps {
    loan: LoanApplication;
    onClose: () => void;
    showToast: (message: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ loan, onClose, showToast }) => {
    const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

    if (selectedInstallment) {
        return (
            <PaymentProofModal
                loanId={loan._id}
                installment={selectedInstallment}
                onClose={() => {
                    setSelectedInstallment(null);
                    onClose(); // Close the main modal as well
                }}
                showToast={showToast}
            />
        );
    }

    return (
        <div className="fixed inset-0 bg-koba-bg bg-opacity-80 flex justify-center items-center z-50">
            <div className="bg-koba-card rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Échéancier de Paiement</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Prêt: {loan.loanPurpose}</h3>
                    <ul className="space-y-3">
                        {loan.installments.map(inst => (
                            <li key={inst.installmentNumber} className="p-3 bg-gray-800/50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-white">Échéance #{inst.installmentNumber}</p>
                                    <p className="text-sm text-gray-400">Montant: {inst.dueAmount.toLocaleString()}F - Date: {new Date(inst.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    {inst.status === InstallmentStatus.EN_ATTENTE ? (
                                        <button 
                                            onClick={() => setSelectedInstallment(inst)}
                                            className="px-3 py-1 text-sm rounded bg-green-600 hover:bg-green-700"
                                        >
                                            Soumettre une preuve
                                        </button>
                                    ) : (
                                        <StatusBadge text={INSTALLMENT_STATUS_CONFIG[inst.status].text} color={INSTALLMENT_STATUS_CONFIG[inst.status].color} />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="flex justify-end mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded bg-gray-600 hover:bg-gray-500">Fermer</button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;