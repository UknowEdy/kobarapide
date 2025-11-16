import React, { useState, useEffect } from 'react';
import { fetchGET, fetchPUT } from '../../../utils/api';
interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  status: 'ACTIF' | 'EN_ATTENTE' | 'SUSPENDU' | 'BLOQUE';
  score: number;
}
const ClientsSection: React.FC = () => {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ACTIF');
  useEffect(() => { loadClients(); }, [filter]);
  const loadClients = async () => {
    setLoading(true);
    const endpoint = '/api/users?role=CLIENT&status=' + filter;
    const res = await fetchGET(endpoint);
    if (res.success) setClients(res.data);
    setLoading(false);
  };
  const handleStatusChange = async (userId: string, newStatus: string) => {
    const endpoint = '/api/users/' + userId;
    const res = await fetchPUT(endpoint, { status: newStatus });
    if (res.success) setClients(clients.map(c => c._id === userId ? res.data.user || res.data : c));
  };
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {['ACTIF', 'EN_ATTENTE', 'SUSPENDU', 'BLOQUE'].map(status => (
          <button key={status} onClick={() => setFilter(status)} className={filter === status ? 'px-4 py-2 bg-orange-500 text-white rounded font-bold' : 'px-4 py-2 bg-gray-700 text-gray-300 rounded'}>
            {status === 'ACTIF' && '✅ Actifs'}
            {status === 'EN_ATTENTE' && '⏳ En Attente'}
            {status === 'SUSPENDU' && '⏸️ Suspendus'}
            {status === 'BLOQUE' && '🚫 Bloqués'}
          </button>
        ))}
      </div>
      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Tél</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? <tr><td colSpan={5} className="px-6 py-4 text-center">Chargement...</td></tr> : clients.length === 0 ? <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-400">Aucun client</td></tr> : clients.map(c => (
              <tr key={c._id} className="hover:bg-gray-700"><td className="px-6 py-4">{c.nom} {c.prenom}</td><td className="px-6 py-4 text-sm text-gray-400">{c.email}</td><td className="px-6 py-4">{c.telephone}</td><td className="px-6 py-4"><span className={c.score >= 5 ? 'bg-green-900 text-green-200 px-2 py-1 rounded' : 'bg-blue-900 text-blue-200 px-2 py-1 rounded'}>{c.score}</span></td><td className="px-6 py-4"><select value={c.status} onChange={(e) => handleStatusChange(c._id, e.target.value)} className="bg-gray-700 text-white px-2 py-1 rounded"><option value="ACTIF">Actif</option><option value="EN_ATTENTE">En Attente</option><option value="SUSPENDU">Suspendu</option><option value="BLOQUE">Bloqué</option></select></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ClientsSection;
