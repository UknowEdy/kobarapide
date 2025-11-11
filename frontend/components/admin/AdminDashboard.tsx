import React, { useState, useEffect } from 'react';
import { fetchGET, logout, getCurrentUser } from '../../utils/api';
import StatsSection from './sections/StatsSection';
import ClientsSection from './sections/ClientsSection';
import LoansSection from './sections/LoansSection';
import WaitingListSection from './sections/WaitingListSection';
import DuplicatesSection from './sections/DuplicatesSection';
import StaffSection from './sections/StaffSection';
import ListStaffSection from './sections/ListStaffSection';
import SettingsSection from './sections/SettingsSection';

type TabType = 'dashboard' | 'clients' | 'loans' | 'waiting' | 'duplicates' | 'staff' | 'liststaff' | 'settings';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalClients: 0, activeLoans: 0, pendingLoans: 0, duplicates: 0 });
  const user = getCurrentUser();

  const tabs = [
    { id: 'dashboard', label: '📊 Tableau de bord' },
    { id: 'clients', label: '👥 Clients' },
    { id: 'loans', label: '💰 Prêts' },
    { id: 'waiting', label: '⏳ Listes d\'attente' },
    { id: 'duplicates', label: '🔍 Doublons' },
    { id: 'staff', label: '👔 Gérer Staff' },
    { id: 'liststaff', label: '👥 Liste Staff' },
    { id: 'settings', label: '⚙️ Paramètres' }
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const res = await fetchGET('/api/admin/stats');
    if (res.success) setStats(res.data);
    setLoading(false);
  };

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StatsSection stats={stats} />;
      case 'clients':
        return <ClientsSection />;
      case 'loans':
        return <LoansSection />;
      case 'waiting':
        return <WaitingListSection />;
      case 'duplicates':
        return <DuplicatesSection />;
      case 'staff':
        return <StaffSection />;
      case 'liststaff':
        return <ListStaffSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return null;
    }
  };

  return (
    <div className={darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}>
      {/* HEADER */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg py-4 px-8 flex justify-between items-center border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <img src="/icon-192x192.png" alt="Kobarapide" className="w-12 h-12" />
          <h1 className="text-2xl font-bold text-orange-500">Admin Kobarapide</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-semibold">Connecté en tant que: <span className="text-orange-500">{user?.role || 'ADMIN'}</span></p>
            <p className="text-xs text-gray-400">{user?.email || 'admin@kobarapide.com'}</p>
          </div>

          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition">
            Déconnexion
          </button>
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-8 py-4 flex gap-2 overflow-x-auto scrollbar-hide`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2 rounded font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white'
                : darkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen p-8`}>
        {loading && activeTab === 'dashboard' ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
}
