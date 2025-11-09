import React from 'react';
import { LoanApplication, LoanStatus } from '../../types';

interface ClientStatsModalProps {
    loans: LoanApplication[];
    onClose: () => void;
}

const ClientStatsModal: React.FC<ClientStatsModalProps> = ({ loans, onClose }) => {
    const totalBorrowed = loans.reduce((sum, loan) => sum + loan.requestedAmount, 0);
    const totalRepaid = loans.flatMap(l => l.installments).reduce((sum, i) => sum + i.paidAmount, 0);
    const repaymentRate = totalBorrowed > 0 ? (totalRepaid / totalBorrowed) * 100 : 0;
    const repaidLoansCount = loans.filter(l => l.status === LoanStatus.REMBOURSE).length;

    const StatItem: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
        <div className="bg-gray-800/50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-koba-accent">{value}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-koba-bg bg-opacity-80 flex justify-center items-center z-50">
            <div className="bg-koba-card rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Vos Statistiques Personnelles</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <StatItem label="Total Emprunté" value={`${totalBorrowed.toLocaleString()}F`} />
                    <StatItem label="Total Remboursé" value={`${totalRepaid.toLocaleString()}F`} />
                    <StatItem label="Prêts Remboursés" value={repaidLoansCount.toString()} />
                    <StatItem label="Taux de Remboursement" value={`${repaymentRate.toFixed(1)}%`} />
                </div>
                <div className="flex justify-end mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded bg-gray-600 hover:bg-gray-500">Fermer</button>
                </div>
            </div>
        </div>
    );
};

export default ClientStatsModal;