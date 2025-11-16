import { useState } from 'react';
import LoadingSpinner from '../shared/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'https://kobarapide.onrender.com';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      // Get token from URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setError('Token de réinitialisation manquant');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/email/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Mot de passe réinitialisé avec succès !');
        setPassword('');
        setConfirmPassword('');

        // Redirect to homepage after 3 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        setError(data.msg || data.message || 'Erreur lors de la réinitialisation');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-koba-bg px-4">
      <img src="/icon-192x192.png" alt="Kobarapide" className="w-24 h-24 mb-8" />
      <h1 className="text-4xl font-bold text-koba-accent mb-2">Réinitialiser le mot de passe</h1>
      <p className="text-koba-text mb-8">Entrez votre nouveau mot de passe</p>

      <div className="bg-koba-card p-8 rounded-lg shadow-lg max-w-md w-full">
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-600 text-white p-3 rounded mb-4">
            {success}
            <p className="text-sm mt-2">Redirection vers la page de connexion...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-koba-text mb-2">Nouveau mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
              className="w-full p-3 bg-koba-bg text-koba-text rounded border border-koba-accent"
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-koba-text mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez le mot de passe"
              className="w-full p-3 bg-koba-bg text-koba-text rounded border border-koba-accent"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-koba-accent text-koba-bg font-bold py-3 rounded hover:opacity-80 disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <LoadingSpinner /> : 'Réinitialiser le mot de passe'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="text-koba-accent hover:underline"
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}
