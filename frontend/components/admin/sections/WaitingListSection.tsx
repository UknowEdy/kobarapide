import React, { useState, useEffect } from 'react';
import { fetchGET, fetchPOST } from '../../../utils/api';

interface WaitingListItem {
  _id: string;
  userId: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
  position: number;
  hasReferralCode: boolean;
  priority: 1 | 2;
  dateInscription: string;
  createdAt: string;
}

const WaitingListSection: React.FC = () => {
  const [items, setItems] = useState<WaitingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadWaitingList(); }, []);

  const loadWaitingList = async () => {
    setLoading(true);
    const res = await fetchGET('/api/waiting-list');
    if (res.success) {
      // Sort by priority (1 first) then by position
      setItems(res.data.sort((a: WaitingListItem, b: WaitingListItem) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.position - b.position;
      }));
    }
    setLoading(false);
  };

  const handleActivate = async (id: string) => {
    if (!confirm('Voulez-vous activer cet utilisateur depuis la liste d\'attente?')) return;

    const res = await fetchPOST(`/api/waiting-list/${id}/activate`, {});
    if (res.success) {
      alert('✅ Utilisateur activé avec succès!');
      loadWaitingList();
    } else {
      alert('❌ Erreur: ' + (res.message || 'Impossible d\'activer l\'utilisateur'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Liste d'Attente</h2>
        <button
          onClick={loadWaitingList}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
        >
          🔄 Rafraîchir
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Priorité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Date Inscription</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-4 text-center">Chargement...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-400">Aucune personne en attente</td></tr>
            ) : items.map(item => (
              <tr key={item._id} className="hover:bg-gray-700">
                <td className="px-6 py-3">
                  <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded font-bold">
                    #{item.position}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${
                    item.priority === 1
                      ? 'bg-yellow-900 text-yellow-200'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {item.hasReferralCode ? '⭐ Parrainé' : 'Standard'}
                  </span>
                </td>
                <td className="px-6 py-3">{item.userId.nom} {item.userId.prenom}</td>
                <td className="px-6 py-3 text-sm text-gray-400">{item.userId.email}</td>
                <td className="px-6 py-3">{item.userId.telephone}</td>
                <td className="px-6 py-3 text-sm">{new Date(item.dateInscription).toLocaleDateString()}</td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => handleActivate(item._id)}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs font-bold"
                  >
                    ✅ Activer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WaitingListSection;
