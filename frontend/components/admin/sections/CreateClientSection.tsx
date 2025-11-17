import { useState } from 'react';

const CreateClientSection = () => {
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    telephone: '',
    pieceIdentite: '',
    dateDeNaissance: '',
    photoUrl: '',
    selfieIdUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://kobarapide.onrender.com';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setGeneratedPassword('');
    setShowPassword(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/create-client`, {
        method: 'POST',
        headers: {
          'x-auth-token': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Client créé avec succès!');
        setGeneratedPassword(data.data.temporaryPassword);
        setShowPassword(true);

        // Reset form
        setFormData({
          email: '',
          nom: '',
          prenom: '',
          telephone: '',
          pieceIdentite: '',
          dateDeNaissance: '',
          photoUrl: '',
          selfieIdUrl: ''
        });
      } else {
        setMessage(`❌ ${data.msg || 'Erreur lors de la création'}`);
      }
    } catch (error) {
      console.error('Erreur création client:', error);
      setMessage('❌ Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    alert('Mot de passe copié dans le presse-papiers!');
  };

  const copyCredentials = () => {
    const credentials = `Email: ${formData.email}\nMot de passe: ${generatedPassword}`;
    navigator.clipboard.writeText(credentials);
    alert('Identifiants copiés dans le presse-papiers!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Créer un Client Manuellement</h2>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <p className="text-gray-400 text-sm mb-6">
          Créez un compte client directement. Un mot de passe sécurisé sera généré automatiquement.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email * <span className="text-red-500">⚠</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="client@example.com"
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Nom * <span className="text-red-500">⚠</span>
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dupont"
              />
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Prénom * <span className="text-red-500">⚠</span>
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jean"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Téléphone * <span className="text-red-500">⚠</span>
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            {/* Pièce d'identité */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                N° Pièce d'Identité * <span className="text-red-500">⚠</span>
              </label>
              <input
                type="text"
                name="pieceIdentite"
                value={formData.pieceIdentite}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ABC123456"
              />
            </div>

            {/* Date de naissance */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Date de Naissance * <span className="text-red-500">⚠</span>
              </label>
              <input
                type="date"
                name="dateDeNaissance"
                value={formData.dateDeNaissance}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Photo URL (optionnel) */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                URL Photo ID (optionnel)
              </label>
              <input
                type="url"
                name="photoUrl"
                value={formData.photoUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            {/* Selfie URL (optionnel) */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                URL Selfie avec ID (optionnel)
              </label>
              <input
                type="url"
                name="selfieIdUrl"
                value={formData.selfieIdUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-semibold ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Création en cours...' : '✅ Créer le Client'}
            </button>
          </div>
        </form>

        {/* Message */}
        {message && (
          <div
            className={`mt-4 p-4 rounded ${
              message.includes('❌') ? 'bg-red-600' : 'bg-green-600'
            } text-white`}
          >
            {message}
          </div>
        )}

        {/* Generated Password */}
        {showPassword && generatedPassword && (
          <div className="mt-6 p-6 bg-green-900 bg-opacity-30 border-2 border-green-500 rounded-lg">
            <h3 className="text-xl font-bold text-green-400 mb-4">
              🔑 Identifiants Générés
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-300">Email:</p>
                <p className="font-mono text-lg text-white">{formData.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-300">Mot de passe temporaire:</p>
                <p className="font-mono text-lg text-green-400 font-bold">
                  {generatedPassword}
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={copyPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  📋 Copier le Mot de Passe
                </button>

                <button
                  onClick={copyCredentials}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                >
                  📋 Copier les Identifiants
                </button>
              </div>

              <div className="mt-4 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded">
                <p className="text-xs text-yellow-200">
                  ⚠️ <strong>IMPORTANT:</strong> Ce mot de passe ne sera affiché qu'une seule fois.
                  <br />
                  Copiez-le et communiquez-le au client de manière sécurisée.
                  <br />
                  Le client pourra le changer après sa première connexion.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-900 rounded border border-gray-700">
          <p className="text-xs text-gray-400">
            <strong>ℹ️ Information:</strong>
          </p>
          <ul className="text-xs text-gray-400 mt-2 space-y-1 ml-4">
            <li>• Le client sera créé directement avec le statut ACTIF</li>
            <li>• Un mot de passe sécurisé (16 caractères) sera généré automatiquement</li>
            <li>• Le client pourra se connecter immédiatement</li>
            <li>• La création est soumise à la limite de clients définie dans les paramètres</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateClientSection;
