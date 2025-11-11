import React from 'react';
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
  const cards = [
    { label: 'Clients actifs', value: stats.totalClients, color: 'bg-blue-600', icon: '👥' },
    { label: 'Prêts actifs', value: stats.activeLoans, color: 'bg-green-600', icon: '✅' },
    { label: 'En attente', value: stats.pendingLoans, color: 'bg-yellow-600', icon: '⏳' },
    { label: 'Doublons', value: stats.duplicates, color: 'bg-red-600', icon: '🔍' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <div key={idx} className={card.color + ' rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition'}>
          <div className="text-3xl mb-2">{card.icon}</div>
          <p className="text-gray-200 text-sm">{card.label}</p>
          <p className="text-4xl font-bold mt-2">{card.value}</p>
        </div>
      ))}
    </div>
  );
};
export default StatsSection;
