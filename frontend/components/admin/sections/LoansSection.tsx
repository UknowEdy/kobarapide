import React, { useState, useEffect } from 'react';
import { fetchGET, fetchPOST } from '../../../utils/api';

// ✅ CORRECTION: Utiliser les noms de champs du backend
interface Loan {
  _id: string;
  requestedAmount: number;
  duration?: number;
  status: 'EN_ATTENTE' | 'APPROUVE' | 'DEBLOQUE' | 'REMBOURSE' | 'REJETE' | 'DEFAUT';
  userId?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  loanPurpose?: string;
  createdAt: string;
}
const LoansSection: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('EN_ATTENTE');

  useEffect(() => { loadLoans(); }, [filter]);

  const loadLoans = async () => {
    setLoading(true);
    // ✅ CORRECTION: Utiliser 'status' au lieu de 'statut'
    const endpoint = '/api/loans?status=' + filter;
    const res = await fetchGET(endpoint);
    if (res.success) setLoans(res.data);
    setLoading(false);
  };
  const handleApprove = async (id: string) => {
    const endpoint = '/api/loans/' + id + '/approve';
    const res = await fetchPOST(endpoint, {});
    if (res.success) setLoans(loans.map(l => l._id === id ? res.data : l));
  };
  // ✅ CORRECTION: Utiliser les statuts français du backend
  const statusLabels: Record<string, string> = {
    'EN_ATTENTE': '⏳ En Attente',
    'APPROUVE': '✅ Approuvé',
    'DEBLOQUE': '💰 Débloqué',
    'REMBOURSE': '✔️ Remboursé',
    'REJETE': '❌ Rejeté',
    'DEFAUT': '⚠️ Défaut'
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {['EN_ATTENTE', 'APPROUVE', 'DEBLOQUE', 'REMBOURSE'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={filter === s ? 'px-4 py-2 bg-orange-500 text-white rounded' : 'px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600'}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>
      <table className="w-full bg-gray-800 rounded overflow-hidden">
        <thead>
          <tr className="bg-gray-900">
            <th className="px-6 py-3 text-left">Client</th>
            <th className="px-6 py-3 text-left">Montant</th>
            <th className="px-6 py-3 text-left">Raison</th>
            <th className="px-6 py-3 text-left">Statut</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {loans.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                {loading ? 'Chargement...' : 'Aucun prêt trouvé'}
              </td>
            </tr>
          ) : (
            loans.map(l => (
              <tr key={l._id} className="hover:bg-gray-700">
                <td className="px-6 py-3">
                  {l.userId ? `${l.userId.prenom} ${l.userId.nom}` : 'N/A'}
                </td>
                <td className="px-6 py-3 text-green-400 font-bold">
                  {l.requestedAmount?.toLocaleString() || 0} F
                </td>
                <td className="px-6 py-3 text-sm text-gray-300">
                  {l.loanPurpose || 'Non spécifié'}
                </td>
                <td className="px-6 py-3">
                  <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs">
                    {statusLabels[l.status] || l.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {l.status === 'EN_ATTENTE' && (
                    <button
                      onClick={() => handleApprove(l._id)}
                      className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
                    >
                      ✅ Approuver
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
export default LoansSection;
