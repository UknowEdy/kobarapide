import React, { useState, useEffect } from 'react';
import { fetchGET, fetchPUT } from '../../../utils/api';
const DuplicatesSection = () => {
  const [dups, setDups] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  useEffect(() => { 
    const load = async () => {
      const res = await fetchGET('/api/duplicates?statut=' + filter);
      if (res.success) setDups(res.data);
    };
    load();
  }, [filter]);
  return (
    <table className="w-full bg-gray-800 rounded">
      <thead><tr className="bg-gray-900"><th className="px-6 py-3">Type</th><th className="px-6 py-3">Score</th></tr></thead>
      <tbody>{dups.map(d => <tr key={d._id}><td className="px-6 py-3">{d.matchType}</td><td className="px-6 py-3">{d.similarityScore}%</td></tr>)}</tbody>
    </table>
  );
};
export default DuplicatesSection;
