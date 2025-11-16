import { useState, useEffect } from 'react';
import LoadingSpinner from '../shared/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'https://kobarapide.onrender.com';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      // Get token from URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de vérification manquant');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/email/verify/${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email vérifié avec succès !');

          // Redirect to homepage after 3 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.msg || data.message || 'Erreur lors de la vérification');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Erreur de connexion au serveur');
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-koba-bg px-4">
      <img src="/icon-192x192.png" alt="Kobarapide" className="w-24 h-24 mb-8" />
      <h1 className="text-4xl font-bold text-koba-accent mb-8">Vérification Email</h1>

      <div className="bg-koba-card p-8 rounded-lg shadow-lg max-w-md w-full">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <LoadingSpinner />
            <p className="text-koba-text mt-4">Vérification en cours...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-500 mb-4">Succès !</h2>
            <p className="text-koba-text mb-4">{message}</p>
            <p className="text-gray-400 text-sm">
              Redirection vers la page de connexion dans 3 secondes...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-500 mb-4">Erreur</h2>
            <p className="text-koba-text mb-6">{message}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-koba-accent text-koba-bg font-bold py-3 px-6 rounded hover:opacity-80"
            >
              Retour à l'accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
