import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../../utils/api';

interface Stats {
  totalClients: number;
  activeLoans: number;
  pendingLoans: number;
  duplicates: number;
}

interface StatsSectionProps {
  stats: Stats;
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const user = getCurrentUser();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [financialStats, setFinancialStats] = useState<any>(null);
  const [loadingFinancial, setLoadingFinancial] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://kobarapide.onrender.com';

  useEffect(() => {
    if (isAdmin) {
      loadFinancialStats();
    }
  }, [isAdmin]);

  const loadFinancialStats = async () => {
    setLoadingFinancial(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/stats/financial`, {
        headers: {
          'x-auth-token': token || '',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setFinancialStats(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement stats financières:', error);
    } finally {
      setLoadingFinancial(false);
    }
  };

  const cards = [
    { label: 'Clients actifs', value: stats.totalClients, color: 'bg-blue-600', icon: '👥' },
    { label: 'Prêts actifs', value: stats.activeLoans, color: 'bg-green-600', icon: '✅' },
    { label: 'En attente', value: stats.pendingLoans, color: 'bg-yellow-600', icon: '⏳' },
    { label: 'Doublons', value: stats.duplicates, color: 'bg-red-600', icon: '🔍' },
  ];

  return (
    <div className="space-y-8">
      {/* Statistiques générales */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Vue d'ensemble</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={card.color + ' rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition'}
            >
              <div className="text-3xl mb-2">{card.icon}</div>
              <p className="text-gray-200 text-sm">{card.label}</p>
              <p className="text-4xl font-bold mt-2">{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques Financières - Visible uniquement pour ADMIN et SUPER_ADMIN */}
      {isAdmin && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">📊 Statistiques Financières</h2>

          {!loadingFinancial && financialStats ? (
            <div className="space-y-6">
              {/* Indicateurs principaux */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
                  <div className="text-2xl mb-2">💰</div>
                  <p className="text-gray-200 text-sm">Total Investi</p>
                  <p className="text-3xl font-bold mt-2">
                    {financialStats.totalInvested?.toLocaleString() || 0} F
                  </p>
                  <p className="text-xs text-blue-200 mt-1">
                    {financialStats.counts?.total || 0} prêts
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white shadow-lg">
                  <div className="text-2xl mb-2">💵</div>
                  <p className="text-gray-200 text-sm">Total Remboursé</p>
                  <p className="text-3xl font-bold mt-2">
                    {financialStats.totalRepaid?.toLocaleString() || 0} F
                  </p>
                  <p className="text-xs text-green-200 mt-1">
                    {financialStats.counts?.repaid || 0} prêts
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 text-white shadow-lg">
                  <div className="text-2xl mb-2">⏳</div>
                  <p className="text-gray-200 text-sm">En Cours</p>
                  <p className="text-3xl font-bold mt-2">
                    {financialStats.totalActive?.toLocaleString() || 0} F
                  </p>
                  <p className="text-xs text-orange-200 mt-1">
                    {financialStats.counts?.active || 0} prêts
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white shadow-lg">
                  <div className="text-2xl mb-2">🧾</div>
                  <p className="text-gray-200 text-sm">Frais de Dossier</p>
                  <p className="text-3xl font-bold mt-2">
                    {financialStats.totalFees?.toLocaleString() || 0} F
                  </p>
                  <p className="text-xs text-purple-200 mt-1">5% des prêts</p>
                </div>
              </div>

              {/* Indicateurs secondaires */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">📈 Bénéfice Net</h3>
                  <p className="text-4xl font-bold text-green-400">
                    {financialStats.netProfit?.toLocaleString() || 0} F
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Basé sur les frais de dossier collectés
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">💯 Taux de Remboursement</h3>
                  <p className="text-4xl font-bold text-blue-400">
                    {financialStats.repaymentRate || 0}%
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Montant remboursé / Montant investi
                  </p>
                </div>
              </div>

              {/* Statistiques par statut */}
              {financialStats.loansByStatus && financialStats.loansByStatus.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">📊 Répartition par Statut</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {financialStats.loansByStatus.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-900 p-4 rounded border border-gray-700"
                      >
                        <p className="text-sm text-gray-400">{item._id || 'Inconnu'}</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {item.count || 0} prêts
                        </p>
                        <p className="text-sm text-gray-500">
                          {(item.total || 0).toLocaleString()} F
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : loadingFinancial ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default StatsSection;
