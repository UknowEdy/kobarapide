import React from 'react';
import { useAppContext } from '../../context/DataContext';
import { LoanApplication, InstallmentStatus } from '../../types';
import { INSTALLMENT_STATUS_CONFIG } from '../../constants';
import StatusBadge from '../shared/StatusBadge';

interface LoanDetailsModalProps {
    loan: LoanApplication;
    clientName: string;
    onClose: () => void;
    showToast: (message: string) => void;
}

const LoanDetailsModal: React.FC<LoanDetailsModalProps> = ({ loan, clientName, onClose, showToast }) => {
    const { confirmPayment, isUpdating } = useAppContext();

    const handleConfirm = async (installmentNumber: number) => {
        const result = await confirmPayment(loan._id, installmentNumber);
        if (result.success) {
            showToast(result.message);
            // We expect the parent component to refetch data and close the modal
            // but we can also close it manually after a delay for better UX
            setTimeout(onClose, 500); 
        } else {
            showToast(result.message || "Erreur lors de la confirmation.");
        }
    };

    return (
        <div className="fixed inset-0 bg-koba-bg bg-opacity-80 flex justify-center items-center z-50">
            <div className="bg-koba-card rounded-lg shadow-xl p-6 w-full max-w-2xl m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Détails du Prêt</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><strong className="text-gray-400">Client:</strong> {clientName}</p>
                        <p><strong className="text-gray-400">Montant:</strong> {loan.requestedAmount.toLocaleString()}F</p>
                        <p><strong className="text-gray-400">Objet:</strong> {loan.loanPurpose}</p>
                        <p><strong className="text-gray-400">Date:</strong> {new Date(loan.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-200 border-t border-gray-700 pt-4 mt-4">Échéancier</h3>
                    <ul className="space-y-3">
                        {loan.installments.map(inst => (
                            <li key={inst.installmentNumber} className="p-3 bg-gray-800/50 rounded-lg">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                    <div>
                                        <p className="font-semibold text-white">Échéance #{inst.installmentNumber} - {inst.dueAmount.toLocaleString()}F</p>
                                        <p className="text-xs text-gray-400">Date limite: {new Date(inst.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="mt-2 sm:mt-0 flex items-center space-x-4">
                                        <StatusBadge text={INSTALLMENT_STATUS_CONFIG[inst.status].text} color={INSTALLMENT_STATUS_CONFIG[inst.status].color} />
                                        {inst.status === InstallmentStatus.EN_ATTENTE_CONFIRMATION && (
                                            <>
                                                <a href={inst.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm">Voir Preuve</a>
                                                <button
                                                    onClick={() => handleConfirm(inst.installmentNumber)}
                                                    disabled={isUpdating}
                                                    className="px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700 disabled:bg-gray-500"
                                                >
                                                    {isUpdating ? '...' : 'Confirmer'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                         {loan.installments.length === 0 && <p className="text-center text-gray-400 text-sm">L'échéancier sera généré après approbation.</p>}
                    </ul>
                </div>
                 <div className="flex justify-end mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded bg-gray-600 hover:bg-gray-500">Fermer</button>
                </div>
            </div>
        </div>
    );
};

export default LoanDetailsModal;