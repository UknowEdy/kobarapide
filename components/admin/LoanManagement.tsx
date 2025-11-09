import React, { useState, useMemo } from 'react';
import Card from '../shared/Card';
import StatusBadge from '../shared/StatusBadge';
import { LoanStatus, LoanApplication } from '../../types';
import { LOAN_STATUS_CONFIG } from '../../constants';
import { useAppContext } from '../../context/DataContext';
import LoanDetailsModal from './LoanDetailsModal';

interface LoanManagementProps {
    showToast: (message: string) => void;
}

type SortKey = 'client' | 'amount' | 'date';

const LoanManagement: React.FC<LoanManagementProps> = ({ showToast }) => {
    const { loans, users, updateLoanStatus } = useAppContext();
    const [filterStatus, setFilterStatus] = useState<LoanStatus | 'ALL'>('ALL');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
    const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);

    const getUserName = (userId: string) => {
        const user = users.find(u => u._id === userId);
        return user ? `${user.prenom} ${user.nom}` : 'Inconnu';
    };

    const handleUpdateStatus = (loanId: string, status: LoanStatus) => {
        let reason: string | undefined;
        if (status === LoanStatus.REJETE) {
            reason = prompt("Veuillez entrer la raison du rejet :");
            if (reason === null) return; // User cancelled prompt
        }
        updateLoanStatus(loanId, status, reason);
        showToast('Statut du prêt mis à jour.');
    }

    const loansWithClientNames = useMemo(() => {
        return loans.map(loan => ({
            ...loan,
            clientName: getUserName(loan.userId),
            needsConfirmation: loan.installments.some(i => i.status === 'EN_ATTENTE_CONFIRMATION')
        }));
    }, [loans, users]);

    const sortedAndFilteredLoans = useMemo(() => {
        let sortableItems = [...loansWithClientNames];
        if (filterStatus !== 'ALL') {
            sortableItems = sortableItems.filter(loan => loan.status === filterStatus);
        }

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;
                if (sortConfig.key === 'client') {
                    aValue = a.clientName;
                    bValue = b.clientName;
                } else if (sortConfig.key === 'amount') {
                    aValue = a.requestedAmount;
                    bValue = b.requestedAmount;
                } else if (sortConfig.key === 'date') {
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                } else {
                    aValue = 0;
                    bValue = 0;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [loansWithClientNames, filterStatus, sortConfig]);

     const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? '▲' : '▼';
    };

    const SortableHeader: React.FC<{ sortKey: SortKey; label: string }> = ({ sortKey, label }) => (
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase cursor-pointer" onClick={() => requestSort(sortKey)}>
            {label} {getSortIndicator(sortKey)}
        </th>
    );


    return (
        <>
            <Card title="Gestion des Prêts">
                <div className="mb-4">
                    <label htmlFor="loan-status-filter" className="text-sm text-gray-300 mr-2">Filtrer par statut:</label>
                    <select 
                        id="loan-status-filter" 
                        value={filterStatus} 
                        onChange={e => setFilterStatus(e.target.value as LoanStatus | 'ALL')}
                        className="bg-gray-700 border border-gray-600 rounded-md p-1 text-sm"
                    >
                        <option value="ALL">Tous</option>
                        {Object.values(LoanStatus).map(status => (
                            <option key={status} value={status}>{LOAN_STATUS_CONFIG[status].text}</option>
                        ))}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <SortableHeader sortKey="client" label="Client" />
                                <SortableHeader sortKey="amount" label="Montant" />
                                <SortableHeader sortKey="date" label="Date Demande" />
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Statut</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-koba-card divide-y divide-gray-700">
                            {sortedAndFilteredLoans.map(loan => (
                                <tr key={loan._id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">{loan.clientName}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{loan.requestedAmount.toLocaleString()}F</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{new Date(loan.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-2">
                                            <StatusBadge text={LOAN_STATUS_CONFIG[loan.status].text} color={LOAN_STATUS_CONFIG[loan.status].color} />
                                            {loan.needsConfirmation && <span title="Paiement en attente de confirmation" className="text-yellow-400">⚠️</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm space-x-2">
                                        <button onClick={() => setSelectedLoan(loan)} className="text-cyan-400 hover:text-cyan-300">Détails</button>
                                        {loan.status === LoanStatus.EN_ATTENTE && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(loan._id, LoanStatus.APPROUVE)} className="text-green-400 hover:text-green-300">Approuver</button>
                                                <button onClick={() => handleUpdateStatus(loan._id, LoanStatus.REJETE)} className="text-red-500 hover:text-red-400">Rejeter</button>
                                            </>
                                        )}
                                        {loan.status === LoanStatus.APPROUVE && (
                                            <button onClick={() => handleUpdateStatus(loan._id, LoanStatus.DEBLOQUE)} className="text-blue-400 hover:text-blue-300">Débloquer</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {selectedLoan && <LoanDetailsModal loan={selectedLoan} clientName={getUserName(selectedLoan.userId)} onClose={() => setSelectedLoan(null)} showToast={showToast} />}
        </>
    );
};

export default LoanManagement;