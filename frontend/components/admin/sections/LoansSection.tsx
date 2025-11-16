import React, { useState, useEffect } from 'react';
import { fetchGET, fetchPOST } from '../../../utils/api';

interface Loan {
  _id: string;
  userId: string;
  requestedAmount: number;
  fees: number;
  netAmount: number;
  loanPurpose: string;
  status: 'EN_ATTENTE' | 'APPROUVE' | 'DEBLOQUE' | 'REMBOURSE' | 'REJETE' | 'DEFAUT';
  installments: any[];
  createdAt: string;
}

const LoansSection: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('EN_ATTENTE');

  useEffect(() => { loadLoans(); }, [filter]);

  const loadLoans = async () => {
    setLoading(true);
    const endpoint = '/api/loans?status=' + filter;
    const res = await fetchGET(endpoint);
    if (res.success) setLoans(res.data);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const endpoint = '/api/loans/' + id + '/approve';
    const res = await fetchPOST(endpoint, {});
    if (res.success) {
      setLoans(loans.map(l => l._id === id ? res.data : l));
      alert('Prêt approuvé avec succès!');
    } else {
      alert('Erreur: ' + (res.message || 'Impossible d\'approuver le prêt'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {['EN_ATTENTE', 'APPROUVE', 'DEBLOQUE', 'REMBOURSE'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={filter === s ? 'px-4 py-2 bg-orange-500 text-white rounded font-bold' : 'px-4 py-2 bg-gray-700 text-gray-300 rounded'}>
            {s === 'EN_ATTENTE' && '⏳ En Attente'}
            {s === 'APPROUVE' && '✅ Approuvés'}
            {s === 'DEBLOQUE' && '💰 Débloqués'}
            {s === 'REMBOURSE' && '✔️ Remboursés'}
          </button>
        ))}
      </div>
      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Montant Demandé</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Frais</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Montant Net</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Raison</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center">Chargement...</td></tr>
            ) : loans.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-400">Aucun prêt</td></tr>
            ) : loans.map(l => (
              <tr key={l._id} className="hover:bg-gray-700">
                <td className="px-6 py-3 text-green-400">{l.requestedAmount.toLocaleString()}F</td>
                <td className="px-6 py-3 text-red-400">{l.fees.toLocaleString()}F</td>
                <td className="px-6 py-3 font-bold">{l.netAmount.toLocaleString()}F</td>
                <td className="px-6 py-3 text-sm">{l.loanPurpose || 'N/A'}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    l.status === 'EN_ATTENTE' ? 'bg-yellow-900 text-yellow-200' :
                    l.status === 'APPROUVE' ? 'bg-green-900 text-green-200' :
                    l.status === 'DEBLOQUE' ? 'bg-blue-900 text-blue-200' :
                    l.status === 'REMBOURSE' ? 'bg-purple-900 text-purple-200' :
                    'bg-gray-900 text-gray-200'
                  }`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {l.status === 'EN_ATTENTE' && (
                    <button
                      onClick={() => handleApprove(l._id)}
                      className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs font-bold"
                    >
                      ✅ Approuver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoansSection;
