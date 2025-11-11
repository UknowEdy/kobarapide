import React, { useState, useEffect } from 'react';
import { fetchGET, fetchPOST } from '../../../utils/api';
const StaffSection = () => {
  const [staff, setStaff] = useState([]);
  useEffect(() => { const load = async () => { const res = await fetchGET('/api/staff'); if (res.success) setStaff(res.data); }; load(); }, []);
  return <table className="w-full bg-gray-800 rounded"><thead><tr className="bg-gray-900"><th className="px-6 py-3">Nom</th><th className="px-6 py-3">Rôle</th></tr></thead><tbody>{staff.map(s => <tr key={s._id}><td className="px-6 py-3">{s.nom}</td><td className="px-6 py-3">{s.role}</td></tr>)}</tbody></table>;
};
export default StaffSection;
