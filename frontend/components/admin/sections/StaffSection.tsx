import React, { useState, useEffect } from 'react';
import { fetchGET, fetchPOST, getCurrentUser } from '../../../utils/api';

interface StaffMember {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'ADMIN' | 'MODERATEUR' | 'SUPER_ADMIN';
  status: string;
}

const StaffSection: React.FC = () => {
  const currentUser = getCurrentUser();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    pieceIdentite: '',
    dateDeNaissance: '',
    role: 'MODERATEUR' as 'ADMIN' | 'MODERATEUR'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadStaff(); }, []);

  const loadStaff = async () => {
    setLoading(true);
    const res = await fetchGET('/api/staff');
    if (res.success) setStaff(res.data);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const res = await fetchPOST('/api/staff', formData);

    if (res.success) {
      setSuccess(`${formData.role} créé avec succès !`);
      setFormData({
        email: '',
        password: '',
        nom: '',
        prenom: '',
        telephone: '',
        pieceIdentite: '',
        dateDeNaissance: '',
        role: 'MODERATEUR'
      });
      setShowForm(false);
      loadStaff(); // Recharger la liste
    } else {
      setError(res.error || 'Erreur lors de la création');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Membres du Staff</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
        >
          {showForm ? '❌ Annuler' : '➕ Ajouter Staff'}
        </button>
      </div>

      {/* Success/Error messages */}
      {error && (
        <div className="bg-red-600 text-white p-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-600 text-white p-3 rounded">
          {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Créer un membre du Staff</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Mot de passe * (min. 6 caractères)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Nom *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Prénom *</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Téléphone *</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Pièce d'identité *</label>
              <input
                type="text"
                name="pieceIdentite"
                value={formData.pieceIdentite}
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Date de naissance *</label>
              <input
                type="date"
                name="dateDeNaissance"
                value={formData.dateDeNaissance}
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Rôle *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
              >
                <option value="MODERATEUR">MODERATEUR</option>
                {isSuperAdmin && <option value="ADMIN">ADMIN</option>}
              </select>
              {!isSuperAdmin && (
                <p className="text-xs text-gray-400 mt-1">
                  ℹ️ Seul un SUPER_ADMIN peut créer un compte ADMIN
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded"
              >
                ✅ Créer le compte staff
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff List */}
      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">Chargement...</td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-400">Aucun membre du staff</td>
              </tr>
            ) : (
              staff.map(s => (
                <tr key={s._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">{s.nom} {s.prenom}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{s.email}</td>
                  <td className="px-6 py-4">
                    <span className={
                      s.role === 'SUPER_ADMIN' ? 'bg-red-900 text-red-200 px-2 py-1 rounded text-xs' :
                      s.role === 'ADMIN' ? 'bg-purple-900 text-purple-200 px-2 py-1 rounded text-xs' :
                      'bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs'
                    }>
                      {s.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={
                      s.status === 'ACTIF' ? 'bg-green-900 text-green-200 px-2 py-1 rounded text-xs' :
                      'bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs'
                    }>
                      {s.status}
                    </span>
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
