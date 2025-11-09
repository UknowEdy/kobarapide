import React, { useState } from 'react';
import { useAppContext } from '../../context/DataContext';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function HomePage() {
  const { login, loading } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-koba-bg px-4">
      <img src="/icon-192x192.png" alt="Kobarapide" className="w-24 h-24 mb-8" />
      
      <h1 className="text-4xl font-bold text-koba-accent mb-2">Kobarapide</h1>
      <p className="text-koba-text text-lg mb-12">Community Lending Platform</p>

      <div className="w-full max-w-md bg-koba-card p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-koba-accent mb-6">Connexion</h2>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-koba-text mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="edemkukuz@gmail.com"
              className="w-full p-3 bg-koba-bg text-koba-text rounded border border-koba-accent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-koba-text mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              className="w-full p-3 bg-koba-bg text-koba-text rounded border border-koba-accent"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-koba-accent text-koba-bg font-bold py-3 rounded hover:opacity-80 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner /> : 'Se connecter'}
          </button>
        </form>

        <p className="text-gray-400 text-sm mt-6 text-center">
          Test: edemkukuz@gmail.com
        </p>
      </div>
    </div>
  );
}
