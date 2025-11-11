import React, { useState, useEffect } from 'react';
import { fetchGET, fetchPUT } from '../../../utils/api';
interface WaitingItem {
  _id: string;
  raison: string;
  priorite: number;
  statut: 'WAITING' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
}
const WaitingListSection: React.FC = () => {
  const [items, setItems] = useState<WaitingItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadWaitingList(); }, []);
  const loadWaitingList = async () => {
    setLoading(true);
    const res = await fetchGET('/api/waiting-list');
    if (res.success) setItems(res.data.sort((a: any, b: any) => b.priorite - a.priorite));
    setLoading(false);
  };
  const handleUpdateStatus = async (id: string, status: string) => {
    const endpoint = '/api/waiting-list/' + id;
    const res = await fetchPUT(endpoint, { statut: status });
    if (res.success) setItems(items.map(i => i._id === id ? res.data : i));
  };
  return (
    <table className="w-full bg-gray-800 rounded overflow-hidden">
      <thead><tr className="bg-gray-900"><th className="px-6 py-3 text-left">Priorité</th><th className="px-6 py-3 text-left">Raison</th><th className="px-6 py-3 text-left">Statut</th><th className="px-6 py-3 text-left">Actions</th></tr></thead>
      <tbody className="divide-y divide-gray-700">
        {items.map(i => (
          <tr key={i._id} className="hover:bg-gray-700"><td className="px-6 py-3"><span className="bg-yellow-900 text-yellow-200 px-2 py-1 rounded">{i.priorite}/10</span></td><td className="px-6 py-3">{i.raison}</td><td className="px-6 py-3"><select value={i.statut} onChange={(e) => handleUpdateStatus(i._id, e.target.value)} className="bg-gray-700 text-white px-2 py-1 rounded"><option>WAITING</option><option>PROCESSING</option><option>APPROVED</option></select></td></tr>
        ))}
      </tbody>
    </table>
  );
};
export default WaitingListSection;
