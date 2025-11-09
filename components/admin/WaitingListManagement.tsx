import React from 'react';
import Card from '../shared/Card';
import { WaitingListItem, User } from '../../types';
import { useAppContext } from '../../context/DataContext';

interface WaitingListManagementProps {
    showToast: (message: string) => void;
}

const WaitingListManagement: React.FC<WaitingListManagementProps> = ({ showToast }) => {
    const { waitingList, users, activateUserFromWaitingList } = useAppContext();
    
    const priorityList = waitingList.filter(item => item.priority === 1).sort((a, b) => a.position - b.position);
    const standardList = waitingList.filter(item => item.priority === 2).sort((a, b) => a.position - b.position);

    const getUserName = (userId: string) => {
        const user = users.find(u => u._id === userId);
        return user ? `${user.prenom} ${user.nom}` : 'Nouvel utilisateur';
    };

    const handleActivate = (waitingId: string) => {
        activateUserFromWaitingList(waitingId);
        showToast("Client activé depuis la liste d'attente.");
    };

    const renderList = (list: WaitingListItem[], title: string) => (
        <div>
            <h4 className="text-md font-semibold mb-2 text-gray-200">{title} ({list.length})</h4>
            <ul className="divide-y divide-gray-700 border border-gray-700 rounded-lg">
                {list.map((item, index) => (
                    <li key={item._id} className="p-3 flex justify-between items-center">
                        <div className="text-gray-300">
                            <span className="font-bold text-gray-100">{index + 1}. </span>
                            <span>{getUserName(item.userId)}</span>
                        </div>
                        <button onClick={() => handleActivate(item._id)} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded">Activer</button>
                    </li>
                ))}
                 {list.length === 0 && <li className="p-3 text-center text-gray-400">Aucun client dans cette liste.</li>}
            </ul>
        </div>
    );

    return (
        <Card title="Listes d'attente">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderList(priorityList, "Prioritaire (avec parrainage)")}
                {renderList(standardList, "Standard (sans parrainage)")}
            </div>
        </Card>
    );
}

export default WaitingListManagement;