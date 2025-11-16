import { useState } from 'react';
import LoadingSpinner from '../shared/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'https://kobarapide.onrender.com';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/email/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
        setEmail('');
      } else {
        setError(data.msg || data.message || 'Erreur lors de l\'envoi');
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
      <h1 className="text-4xl font-bold text-koba-accent mb-2">Mot de passe oublié</h1>
      <p className="text-koba-text mb-8">Entrez votre email pour réinitialiser votre mot de passe</p>

      <div className="bg-koba-card p-8 rounded-lg shadow-lg max-w-md w-full">
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-600 text-white p-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-koba-text mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
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
            {loading ? <LoadingSpinner /> : 'Envoyer le lien de réinitialisation'}
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
