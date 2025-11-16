import React, { useState, useEffect } from 'react';
import { fetchGET } from '../../../utils/api';

interface Stats {
  totalClients: number;
  activeClients: number;
  pendingClients: number;
  totalStaff: number;
  totalLoans: number;
  activeLoans: number;
  pendingLoans: number;
  completedLoans: number;
  duplicates: number;
  waitingListCount: number;
  totalLoanAmount: number;
  totalFees: number;
}

const StatsSection: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    activeClients: 0,
    pendingClients: 0,
    totalStaff: 0,
    totalLoans: 0,
    activeLoans: 0,
    pendingLoans: 0,
    completedLoans: 0,
    duplicates: 0,
    waitingListCount: 0,
    totalLoanAmount: 0,
    totalFees: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const res = await fetchGET('/api/admin/stats');
    if (res.success) {
      setStats(res.data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  const cards = [
    { label: 'Total Clients', value: stats.totalClients, color: 'bg-blue-600', icon: '👥', sublabel: `${stats.activeClients} actifs` },
    { label: 'Prêts Actifs', value: stats.activeLoans, color: 'bg-green-600', icon: '💰', sublabel: `${stats.totalLoans} total` },
    { label: 'En Attente', value: stats.pendingLoans, color: 'bg-yellow-600', icon: '⏳', sublabel: `${stats.completedLoans} complétés` },
    { label: 'Doublons', value: stats.duplicates, color: 'bg-red-600', icon: '⚠️', sublabel: 'À traiter' },
    { label: 'Liste d\'Attente', value: stats.waitingListCount, color: 'bg-purple-600', icon: '📋', sublabel: 'En attente' },
    { label: 'Personnel', value: stats.totalStaff, color: 'bg-indigo-600', icon: '👔', sublabel: 'Membres' },
    { label: 'Montant Total Prêts', value: `${stats.totalLoanAmount.toLocaleString()}F`, color: 'bg-teal-600', icon: '💵', sublabel: `${stats.totalFees.toLocaleString()}F frais` },
    { label: 'Nouveaux Clients', value: stats.pendingClients, color: 'bg-orange-600', icon: '🆕', sublabel: 'À approuver' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Statistiques</h2>
        <button
          onClick={loadStats}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
        >
          🔄 Rafraîchir
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`${card.color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105`}
          >
            <div className="text-4xl mb-2">{card.icon}</div>
            <p className="text-gray-100 text-sm font-semibold mb-1">{card.label}</p>
            <p className="text-3xl font-bold mb-2">{card.value}</p>
            <p className="text-xs text-gray-200 opacity-75">{card.sublabel}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
