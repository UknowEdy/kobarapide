import React, { useState, useEffect } from 'react';
import { fetchGET, fetchPOST, fetchPUT } from '../../../utils/api';

interface StaffMember {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'ADMIN' | 'MODERATEUR' | 'SUPER_ADMIN';
  status: string;
  createdAt: string;
}

const StaffSection: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    role: 'MODERATEUR' as 'ADMIN' | 'MODERATEUR' | 'SUPER_ADMIN'
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    const res = await fetchGET('/api/staff');
    if (res.success) {
      setStaff(res.data);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    let endpoint = '';
    if (formData.role === 'SUPER_ADMIN') endpoint = '/api/staff/create-super-admin';
    else if (formData.role === 'ADMIN') endpoint = '/api/staff/create-admin';
    else if (formData.role === 'MODERATEUR') endpoint = '/api/staff/create-moderateur';

    const res = await fetchPOST(endpoint, formData);

    if (res.success) {
      alert('✅ Membre du personnel créé avec succès!');
      setShowCreateForm(false);
      setFormData({ email: '', password: '', nom: '', prenom: '', role: 'MODERATEUR' });
      loadStaff();
    } else {
      alert('❌ Erreur: ' + (res.message || 'Impossible de créer le membre'));
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!confirm('Confirmer le changement de statut?')) return;

    const res = await fetchPUT(`/api/staff/${id}`, { status: newStatus });

    if (res.success) {
      alert('✅ Statut mis à jour!');
      loadStaff();
    } else {
      alert('❌ Erreur: ' + (res.message || 'Impossible de mettre à jour le statut'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion du Personnel</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold"
        >
          + Ajouter Membre
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Créer un Nouveau Membre du Personnel</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm">Prénom</label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
                className="w-full p-3 rounded bg-gray-700 border border-gray-600"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Nom</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                className="w-full p-3 rounded bg-gray-700 border border-gray-600"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full p-3 rounded bg-gray-700 border border-gray-600"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Mot de passe</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full p-3 rounded bg-gray-700 border border-gray-600"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Rôle</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full p-3 rounded bg-gray-700 border border-gray-600"
              >
                <option value="MODERATEUR">Modérateur</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-3 rounded font-bold"
              >
                ✅ Créer
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded font-bold"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Date Création</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center">Chargement...</td></tr>
            ) : staff.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-400">Aucun membre du personnel</td></tr>
            ) : (
              staff.map(member => (
                <tr key={member._id} className="hover:bg-gray-700">
                  <td className="px-6 py-3">{member.prenom} {member.nom}</td>
                  <td className="px-6 py-3 text-sm text-gray-400">{member.email}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      member.role === 'SUPER_ADMIN' ? 'bg-red-900 text-red-200' :
                      member.role === 'ADMIN' ? 'bg-blue-900 text-blue-200' :
                      'bg-green-900 text-green-200'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={member.status}
                      onChange={(e) => handleUpdateStatus(member._id, e.target.value)}
                      className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                    >
                      <option value="ACTIF">Actif</option>
                      <option value="SUSPENDU">Suspendu</option>
                      <option value="BLOQUE">Bloqué</option>
                    </select>
                  </td>
                  <td className="px-6 py-3 text-sm">{new Date(member.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => alert('Fonctionnalité à venir: Modifier ' + member.email)}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
                    >
                      ✏️ Modifier
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffSection;
