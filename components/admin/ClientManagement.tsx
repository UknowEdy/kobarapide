import React, { useState, useMemo } from 'react';
import Card from '../shared/Card';
import StatusBadge from '../shared/StatusBadge';
import { ClientStatus, Role, User } from '../../types';
import { CLIENT_STATUS_CONFIG } from '../../constants';
import { useAppContext } from '../../context/DataContext';
import PhotoHistoryModal from './PhotoHistoryModal';

interface ClientManagementProps {
    showToast: (message: string) => void;
}

type SortKey = 'name' | 'email' | 'score';

const ClientManagement: React.FC<ClientManagementProps> = ({ showToast }) => {
    const { users, updateUserStatus, resendVerificationEmail } = useAppContext();
    const [filterStatus, setFilterStatus] = useState<ClientStatus | 'ALL'>('ALL');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
    const [selectedUserForPhotos, setSelectedUserForPhotos] = useState<User | null>(null);

    const clients = useMemo(() => {
        return users.filter(u => u.role === Role.CLIENT);
    }, [users]);
    
    const handleUpdateStatus = (userId: string, status: ClientStatus) => {
        updateUserStatus(userId, status);
        showToast(`Statut du client mis à jour.`);
    }

    const sortedAndFilteredClients = useMemo(() => {
        let sortableItems = [...clients];
        if (filterStatus !== 'ALL') {
            sortableItems = sortableItems.filter(client => client.status === filterStatus);
        }

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;
                if (sortConfig.key === 'name') {
                    aValue = `${a.prenom} ${a.nom}`;
                    bValue = `${b.prenom} ${b.nom}`;
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [clients, filterStatus, sortConfig]);

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
            <Card title="Gestion des Clients">
                <div className="mb-4">
                    <label htmlFor="status-filter" className="text-sm text-gray-300 mr-2">Filtrer par statut:</label>
                    <select 
                        id="status-filter" 
                        value={filterStatus} 
                        onChange={e => setFilterStatus(e.target.value as ClientStatus | 'ALL')}
                        className="bg-gray-700 border border-gray-600 rounded-md p-1 text-sm"
                    >
                        <option value="ALL">Tous</option>
                        {Object.values(ClientStatus).map(status => (
                            <option key={status} value={status}>{CLIENT_STATUS_CONFIG[status]?.text || status}</option>
                        ))}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <SortableHeader sortKey="name" label="Client" />
                                <SortableHeader sortKey="email" label="Email" />
                                <SortableHeader sortKey="score" label="Score" />
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Statut</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Photos</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-koba-card divide-y divide-gray-700">
                            {sortedAndFilteredClients.map(user => (
                                <tr key={user._id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">{user.prenom} {user.nom}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                                        {user.email}
                                        {!user.isEmailVerified && <span title="Email non vérifié" className="ml-2 text-yellow-400">⚠️</span>}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300 text-center">{user.score}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <StatusBadge text={CLIENT_STATUS_CONFIG[user.status].text} color={CLIENT_STATUS_CONFIG[user.status].color} />
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <button onClick={() => setSelectedUserForPhotos(user)} className="text-cyan-400 hover:text-cyan-300">
                                            Voir Photos
                                        </button>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm space-x-2">
                                        {!user.isEmailVerified && <button onClick={() => resendVerificationEmail(user._id)} className="text-blue-400 hover:text-blue-300">Renvoyer Verif.</button>}
                                        {user.status !== ClientStatus.ACTIF && (
                                            <button 
                                                onClick={() => handleUpdateStatus(user._id, ClientStatus.ACTIF)} 
                                                className="text-green-400 hover:text-green-300"
                                            >
                                                Activer
                                            </button>
                                        )}
                                        <button onClick={() => handleUpdateStatus(user._id, ClientStatus.SUSPENDU)} className="text-orange-400 hover:text-orange-300">Suspendre</button>
                                        <button onClick={() => handleUpdateStatus(user._id, ClientStatus.BLOQUE)} className="text-red-500 hover:text-red-400">Bloquer</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {selectedUserForPhotos && (
                <PhotoHistoryModal 
                    user={selectedUserForPhotos}
                    onClose={() => setSelectedUserForPhotos(null)}
                />
            )}
        </>
    );
};

export default ClientManagement;