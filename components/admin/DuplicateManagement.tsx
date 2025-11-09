import React, { useState } from 'react';
import Card from '../shared/Card';
import { PotentialDuplicate, ClientStatus } from '../../types';
import { useAppContext } from '../../context/DataContext';

interface DuplicateManagementProps {
    showToast: (message: string) => void;
}

const DuplicateManagement: React.FC<DuplicateManagementProps> = ({ showToast }) => {
    const { potentialDuplicates, resolveDuplicate, updateUserStatus } = useAppContext();
    const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({});

    const handleReasonChange = (email: string, reason: string) => {
        setRejectionReasons(prev => ({ ...prev, [email]: reason }));
    };

    const handleResolve = (newUserEmail: string, action: 'approve' | 'reject', reason?: string) => {
        resolveDuplicate(newUserEmail, action, reason);
        const message = action === 'approve'
            ? "L'inscription a été approuvée et l'email de vérification envoyé."
            : "L'inscription a été rejetée.";
        showToast(message);
    };

    const handleUpdateStatus = (userId: string, status: ClientStatus) => {
        updateUserStatus(userId, status);
        const message = status === ClientStatus.SUSPENDU ? 'Le compte existant a été suspendu.' : 'Le compte existant a été bloqué.';
        showToast(message);
    }

    const UserInfo: React.FC<{ title: string, user: any, photo?: string }> = ({ title, user, photo }) => (
        <div className="p-4 bg-gray-800/50 rounded-lg">
            <h4 className="font-bold text-lg mb-2 text-koba-accent">{title}</h4>
            {photo && <img src={photo} alt={`Photo de ${user.prenom}`} className="w-24 h-24 rounded-full mb-2 object-cover" />}
            <p><strong>Nom:</strong> {user.prenom} {user.nom}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Téléphone:</strong> {user.telephone}</p>
            <p><strong>Pièce d'identité:</strong> {user.pieceIdentite}</p>
            <p><strong>Date de naissance:</strong> {new Date(user.dateDeNaissance).toLocaleDateString()}</p>
        </div>
    );

    return (
        <Card title={`Gestion des Doublons (${potentialDuplicates.length})`}>
            {potentialDuplicates.length === 0 ? (
                <p className="text-gray-400 text-center">Aucun doublon potentiel à examiner.</p>
            ) : (
                <div className="space-y-6">
                    {potentialDuplicates.map((dup, index) => (
                        <div key={index} className="border border-gray-700 rounded-lg p-4">
                            <h3 className="text-xl font-semibold mb-2 text-yellow-400">Cas de Doublon Potentiel</h3>
                            <p className="text-sm text-gray-400 mb-4"><strong>Motif:</strong> {dup.reason}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <UserInfo title="Nouvelle Inscription" user={dup.newUser} />
                                <UserInfo title="Compte Existant" user={dup.existingUser} photo={dup.existingUser.photoUrl} />
                            </div>

                            <div className="bg-koba-bg p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-200 mb-2">Actions Administrateur</h4>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                                    <button onClick={() => handleResolve(dup.newUser.email, 'approve')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm">Approuver l'inscription (Email Verif.)</button>
                                    <button onClick={() => handleUpdateStatus(dup.existingUser._id, ClientStatus.SUSPENDU)} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded text-sm">Suspendre le compte existant</button>
                                    <button onClick={() => handleUpdateStatus(dup.existingUser._id, ClientStatus.BLOQUE)} className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-3 rounded text-sm">Bloquer le compte existant</button>
                                </div>
                                <div className="mt-4">
                                    <textarea
                                        placeholder="Raison du rejet de la nouvelle inscription..."
                                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-koba-accent"
                                        value={rejectionReasons[dup.newUser.email] || ''}
                                        onChange={(e) => handleReasonChange(dup.newUser.email, e.target.value)}
                                    />
                                    <button
                                        onClick={() => handleResolve(dup.newUser.email, 'reject', rejectionReasons[dup.newUser.email])}
                                        disabled={!rejectionReasons[dup.newUser.email]}
                                        className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    >
                                        Rejeter la nouvelle inscription
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default DuplicateManagement;