import React, { useState } from 'react';
import Card from '../shared/Card';
import { Role, User } from '../../types';
import { useAppContext } from '../../context/DataContext';
import AddStaffModal from './AddStaffModal';

interface StaffManagementProps {
    showToast: (message: string) => void;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ showToast }) => {
    const { users, loggedInUser, updateStaffRole, deleteStaffMember } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    if (!loggedInUser) return null;

    const staff = users.filter(u => u.role !== Role.CLIENT);

    const handleRoleChange = (userId: string, newRole: Role) => {
        if (window.confirm("Êtes-vous sûr de vouloir changer le rôle de cet utilisateur ?")) {
            updateStaffRole(userId, newRole);
            showToast("Rôle mis à jour avec succès.");
        }
    };

    const handleDelete = (userId: string, userName: string) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ? Cette action est irréversible.`)) {
            deleteStaffMember(userId);
            showToast(`${userName} a été supprimé.`);
        }
    };

    return (
        <>
            <Card 
                title="Gestion du Staff" 
                actions={loggedInUser.role === Role.SUPER_ADMIN && (
                    <button onClick={() => setIsModalOpen(true)} className="bg-koba-accent hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded text-sm">
                        Ajouter un membre
                    </button>
                )}
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Nom</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Rôle</th>
                                {loggedInUser.role === Role.SUPER_ADMIN && <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-koba-card divide-y divide-gray-700">
                            {staff.map(member => (
                                <tr key={member._id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">{member.prenom} {member.nom}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{member.email}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                                        {loggedInUser.role === Role.SUPER_ADMIN && loggedInUser._id !== member._id ? (
                                            <select 
                                                value={member.role} 
                                                onChange={(e) => handleRoleChange(member._id, e.target.value as Role)}
                                                className="bg-gray-700 border border-gray-600 rounded-md p-1 text-sm"
                                            >
                                                <option value={Role.MODERATEUR}>Modérateur</option>
                                                <option value={Role.ADMIN}>Admin</option>
                                                <option value={Role.SUPER_ADMIN}>Super Admin</option>
                                            </select>
                                        ) : member.role}
                                    </td>
                                    {loggedInUser.role === Role.SUPER_ADMIN && (
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                            {loggedInUser._id !== member._id ? (
                                                <button onClick={() => handleDelete(member._id, `${member.prenom} ${member.nom}`)} className="text-red-500 hover:text-red-400">Supprimer</button>
                                            ) : <span className="text-xs text-gray-500">Vous</span>}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {isModalOpen && <AddStaffModal onClose={() => setIsModalOpen(false)} showToast={showToast} />}
        </>
    );
}

export default StaffManagement;