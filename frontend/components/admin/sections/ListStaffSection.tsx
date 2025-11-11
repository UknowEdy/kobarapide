import React, { useState, useEffect } from 'react';
import { fetchGET } from '../../../utils/api';
const ListStaffSection = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetchGET('/api/staff');
      console.log('Staff Response:', res);
      if (res.success) setStaff(res.data);
      setLoading(false);
    };
    load();
  }, []);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Liste complète du STAFF</h2>
      <p className="text-gray-400 mb-4">Total: {staff.length}</p>
      <table className="w-full bg-gray-800 rounded">
        <thead><tr className="bg-gray-900"><th className="px-6 py-3 text-left">Email</th><th className="px-6 py-3 text-left">Nom</th><th className="px-6 py-3 text-left">Rôle</th><th className="px-6 py-3 text-left">Statut</th></tr></thead>
        <tbody>{staff.map(s => <tr key={s._id} className="border-b border-gray-700"><td className="px-6 py-3">{s.email}</td><td className="px-6 py-3">{s.nom} {s.prenom}</td><td className="px-6 py-3"><span className="bg-blue-900 px-2 py-1 rounded">{s.role}</span></td><td className="px-6 py-3">{s.statut}</td></tr>)}</tbody>
      </table>
    </div>
  );
};
export default ListStaffSection;
