import React, { useState, useEffect } from 'react';
import { fetchGET, fetchPOST } from '../../../utils/api';
interface Loan {
  _id: string;
  montant: number;
  duree: number;
  statut: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'REJECTED' | 'DEFAULTED';
  montantRembourse: number;
}
const LoansSection: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  useEffect(() => { loadLoans(); }, [filter]);
  const loadLoans = async () => {
    setLoading(true);
    const endpoint = '/api/loans?statut=' + filter;
    const res = await fetchGET(endpoint);
    if (res.success) setLoans(res.data);
    setLoading(false);
  };
  const handleApprove = async (id: string) => {
    const endpoint = '/api/loans/' + id + '/approve';
    const res = await fetchPOST(endpoint, {});
    if (res.success) setLoans(loans.map(l => l._id === id ? res.data : l));
  };
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {['PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={filter === s ? 'px-4 py-2 bg-orange-500 text-white rounded' : 'px-4 py-2 bg-gray-700'}>
            {s}
          </button>
        ))}
      </div>
      <table className="w-full bg-gray-800 rounded overflow-hidden">
        <thead><tr className="bg-gray-900"><th className="px-6 py-3 text-left">Montant</th><th className="px-6 py-3 text-left">Durée</th><th className="px-6 py-3 text-left">Statut</th><th className="px-6 py-3 text-left">Actions</th></tr></thead>
        <tbody className="divide-y divide-gray-700">
          {loans.map(l => (
            <tr key={l._id} className="hover:bg-gray-700"><td className="px-6 py-3 text-green-400">{'$' + l.montant}</td><td className="px-6 py-3">{l.duree}j</td><td className="px-6 py-3"><span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs">{l.statut}</span></td><td className="px-6 py-3">{l.statut === 'PENDING' && <button onClick={() => handleApprove(l._id)} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs">✅ Approuver</button>}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default LoansSection;
