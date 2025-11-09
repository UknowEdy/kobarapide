import { useState } from 'react';
import { useAppContext } from '../../context/DataContext';

export default function AdminDashboard() {
  const { logout } = useAppContext();
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: '📊 Tableau de bord' },
    { id: 'clients', label: '👥 Clients' },
    { id: 'loans', label: '💰 Prêts' },
    { id: 'waiting', label: '⏳ Liste d\'attente' },
    { id: 'duplicates', label: '🔍 Doublons' },
    { id: 'staff', label: '👔 Staff' },
    { id: 'settings', label: '⚙️ Paramètres' }
  ];

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-koba-accent mb-6">📊 Tableau de bord</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-koba-card p-6 rounded-lg border-l-4 border-koba-accent">
                <p className="text-gray-400 text-sm">Total Clients</p>
                <p className="text-3xl font-bold text-koba-accent">500</p>
              </div>
              <div className="bg-koba-card p-6 rounded-lg border-l-4 border-green-500">
                <p className="text-gray-400 text-sm">Prêts Actifs</p>
                <p className="text-3xl font-bold text-green-500">45</p>
              </div>
              <div className="bg-koba-card p-6 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-400 text-sm">En Attente</p>
                <p className="text-3xl font-bold text-blue-500">12</p>
              </div>
              <div className="bg-koba-card p-6 rounded-lg border-l-4 border-red-500">
                <p className="text-gray-400 text-sm">Doublons</p>
                <p className="text-3xl font-bold text-red-500">8</p>
              </div>
            </div>
          </div>
        );

      case 'clients':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-koba-accent mb-6">👥 Gestion des Clients</h2>
            <div className="bg-koba-card p-6 rounded-lg">
              <p className="text-koba-text">Liste des clients avec score de crédit, statut, etc.</p>
              <div className="mt-4 space-y-2">
                <div className="bg-koba-bg p-3 rounded flex justify-between">
                  <span>Client 1 - Score: 8/10</span>
                  <span className="text-green-500">✓ Actif</span>
                </div>
                <div className="bg-koba-bg p-3 rounded flex justify-between">
                  <span>Client 2 - Score: 5/10</span>
                  <span className="text-yellow-500">⚠ En attente</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'loans':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-koba-accent mb-6">💰 Gestion des Prêts</h2>
            <div className="bg-koba-card p-6 rounded-lg">
              <p className="text-koba-text">Liste de tous les prêts avec statuts et montants</p>
              <div className="mt-4 space-y-2">
                <div className="bg-koba-bg p-3 rounded flex justify-between">
                  <span>Prêt #001 - 50,000 CFA</span>
                  <span className="text-green-500">Approuvé</span>
                </div>
                <div className="bg-koba-bg p-3 rounded flex justify-between">
                  <span>Prêt #002 - 30,000 CFA</span>
                  <span className="text-blue-500">En cours</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'waiting':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-koba-accent mb-6">⏳ Liste d'attente</h2>
            <div className="bg-koba-card p-6 rounded-lg">
              <p className="text-koba-text">Clients en attente d'approbation</p>
              <div className="mt-4 space-y-2">
                <div className="bg-koba-bg p-3 rounded">
                  <p className="font-bold">Jean Dupont</p>
                  <p className="text-sm text-gray-400">En attente depuis 2 jours</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'duplicates':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-koba-accent mb-6">🔍 Détection des Doublons</h2>
            <div className="bg-koba-card p-6 rounded-lg">
              <p className="text-koba-text">Doublons potentiels (email, téléphone, identité)</p>
              <div className="mt-4 space-y-2">
                <div className="bg-red-900/20 p-3 rounded border border-red-500">
                  <p className="font-bold text-red-400">⚠️ Doublon détecté</p>
                  <p className="text-sm">Même email: client@example.com</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'staff':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-koba-accent mb-6">👔 Gestion du Staff</h2>
            <div className="bg-koba-card p-6 rounded-lg">
              <button className="bg-koba-accent text-koba-bg px-4 py-2 rounded mb-4 font-bold hover:opacity-80">
                + Ajouter un staff
              </button>
              <div className="space-y-2">
                <div className="bg-koba-bg p-3 rounded flex justify-between">
                  <span>Admin 1 - Jean</span>
                  <span className="text-blue-500">Admin</span>
                </div>
                <div className="bg-koba-bg p-3 rounded flex justify-between">
                  <span>Modérateur 1 - Marie</span>
                  <span className="text-yellow-500">Modérateur</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-koba-accent mb-6">⚙️ Paramètres</h2>
            <div className="bg-koba-card p-6 rounded-lg space-y-4">
              <div>
                <label className="block text-koba-text mb-2">Score de crédit minimum</label>
                <input type="number" defaultValue="3" className="w-full p-2 bg-koba-bg text-koba-text rounded border border-koba-accent" />
              </div>
              <div>
                <label className="block text-koba-text mb-2">Montant minimum de prêt</label>
                <input type="number" defaultValue="10000" className="w-full p-2 bg-koba-bg text-koba-text rounded border border-koba-accent" />
              </div>
              <button className="bg-koba-accent text-koba-bg px-6 py-2 rounded font-bold hover:opacity-80">
                Sauvegarder
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={darkMode ? 'bg-koba-bg text-koba-text' : 'bg-gray-100 text-gray-900'}>
      {/* HEADER */}
      <header className={`${darkMode ? 'bg-koba-card' : 'bg-white'} shadow-lg py-4 px-6 flex justify-between items-center`}>
        <div className="flex items-center gap-4">
          <img src="/icon-192x192.png" alt="Kobarapide" className="w-16 h-16" />
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-koba-accent' : 'text-koba-accent'}`}>Kobarapide</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded ${darkMode ? 'bg-koba-bg text-yellow-400' : 'bg-gray-300 text-gray-900'}`}
          >
            {darkMode ? '🌙' : '☀️'}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700"
          >
            Se déconnecter
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className={`${darkMode ? 'bg-koba-card' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-300'} px-6 py-4 flex gap-4 overflow-x-auto`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-koba-accent text-koba-bg'
                : darkMode
                ? 'bg-koba-bg text-koba-text hover:bg-gray-700'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <div className={darkMode ? 'bg-koba-bg' : 'bg-gray-100'}>
        {renderContent()}
      </div>
    </div>
  );
}
