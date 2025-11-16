import React, { useState, useEffect } from 'react';
import { fetchGET, fetchPOST } from '../../../utils/api';

interface PotentialDuplicate {
  _id: string;
  newUser: {
    email: string;
    nom: string;
    prenom: string;
    telephone: string;
    pieceIdentite: string;
    dateDeNaissance: string;
  };
  existingUser: {
    _id: string;
    email: string;
    nom: string;
    prenom: string;
    telephone: string;
    pieceIdentite: string;
    dateDeNaissance: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
}

const DuplicatesSection: React.FC = () => {
  const [duplicates, setDuplicates] = useState<PotentialDuplicate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadDuplicates();
  }, [filter]);

  const loadDuplicates = async () => {
    setLoading(true);
    const res = await fetchGET(`/api/duplicates?status=${filter}`);
    if (res.success) {
      setDuplicates(res.data);
    }
    setLoading(false);
  };

  const handleResolve = async (newUserEmail: string, action: 'approve' | 'reject') => {
    const reason = prompt(`Raison pour ${action === 'approve' ? 'approuver' : 'rejeter'} ce doublon:`);
    if (!reason) return;

    const res = await fetchPOST('/api/duplicates/resolve', {
      newUserEmail,
      action,
      reason
    });

    if (res.success) {
      alert(`✅ Doublon ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès!`);
      loadDuplicates();
    } else {
      alert('❌ Erreur: ' + (res.message || 'Impossible de résoudre le doublon'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Détection de Doublons</h2>
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded text-sm ${
                filter === status
                  ? 'bg-orange-500 text-white font-bold'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {status === 'pending' && '⏳ En Attente'}
              {status === 'approved' && '✅ Approuvés'}
              {status === 'rejected' && '❌ Rejetés'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-gray-800 p-6 rounded-lg text-center">Chargement...</div>
        ) : duplicates.length === 0 ? (
          <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
            Aucun doublon {filter === 'pending' ? 'en attente' : filter === 'approved' ? 'approuvé' : 'rejeté'}
          </div>
        ) : (
          duplicates.map(dup => (
            <div key={dup._id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-orange-400 mb-2">⚠️ Doublon Potentiel Détecté</h3>
                  <p className="text-sm text-gray-400 mb-2">
                    <span className="font-semibold">Raison:</span> {dup.reason}
                  </p>
                  <p className="text-xs text-gray-500">
                    Détecté le: {new Date(dup.createdAt).toLocaleString()}
                  </p>
                  {dup.resolvedAt && (
                    <p className="text-xs text-gray-500">
                      Résolu le: {new Date(dup.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  dup.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                  dup.status === 'approved' ? 'bg-green-900 text-green-200' :
                  'bg-red-900 text-red-200'
                }`}>
                  {dup.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nouvel Utilisateur */}
                <div className="bg-gray-900 rounded p-4 border-2 border-blue-500">
                  <h4 className="font-bold text-blue-400 mb-3">📝 Nouvel Utilisateur</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">Nom:</span> {dup.newUser.nom} {dup.newUser.prenom}</p>
                    <p><span className="text-gray-400">Email:</span> {dup.newUser.email}</p>
                    <p><span className="text-gray-400">Tél:</span> {dup.newUser.telephone}</p>
                    <p><span className="text-gray-400">Pièce ID:</span> {dup.newUser.pieceIdentite}</p>
                    <p><span className="text-gray-400">Date Naissance:</span> {dup.newUser.dateDeNaissance}</p>
                  </div>
                </div>

                {/* Utilisateur Existant */}
                <div className="bg-gray-900 rounded p-4 border-2 border-red-500">
                  <h4 className="font-bold text-red-400 mb-3">👤 Utilisateur Existant</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">Nom:</span> {dup.existingUser.nom} {dup.existingUser.prenom}</p>
                    <p><span className="text-gray-400">Email:</span> {dup.existingUser.email}</p>
                    <p><span className="text-gray-400">Tél:</span> {dup.existingUser.telephone}</p>
                    <p><span className="text-gray-400">Pièce ID:</span> {dup.existingUser.pieceIdentite}</p>
                    <p><span className="text-gray-400">Date Naissance:</span> {dup.existingUser.dateDeNaissance}</p>
                  </div>
                </div>
              </div>

              {dup.status === 'pending' && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleResolve(dup.newUser.email, 'approve')}
                    className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold"
                  >
                    ✅ Approuver (Utilisateurs Différents)
                  </button>
                  <button
                    onClick={() => handleResolve(dup.newUser.email, 'reject')}
                    className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-bold"
                  >
                    ❌ Rejeter (Même Personne)
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DuplicatesSection;
