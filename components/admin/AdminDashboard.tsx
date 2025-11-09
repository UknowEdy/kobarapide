import React, { useState } from 'react';
import { Role } from '../../types';
import { useAppContext } from '../../context/DataContext';
import Card from '../shared/Card';
import DashboardStats from './DashboardStats';
import ClientManagement from './ClientManagement';
import LoanManagement from './LoanManagement';
import WaitingListManagement from './WaitingListManagement';
import DuplicateManagement from './DuplicateManagement';
import CapacitySettings from './CapacitySettings';
import StaffManagement from './StaffManagement';
import Toast from '../shared/Toast';

type AdminTab = 'stats' | 'clients' | 'loans' | 'waitingList' | 'duplicates' | 'settings' | 'staff';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [toastMessage, setToastMessage] = useState('');
  const { loggedInUser } = useAppContext();

  if (!loggedInUser) return null;
  
  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <DashboardStats />;
      case 'clients':
        return <ClientManagement showToast={showToast} />;
      case 'loans':
        return <LoanManagement showToast={showToast} />;
      case 'waitingList':
          return <WaitingListManagement showToast={showToast} />;
      case 'duplicates':
          return <DuplicateManagement showToast={showToast} />;
      case 'settings':
          return <CapacitySettings showToast={showToast} />;
       case 'staff':
          return <StaffManagement showToast={showToast} />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{tab: AdminTab; label: string}> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tab
          ? 'bg-koba-accent text-white'
          : 'text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen">
       {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      <header className="bg-koba-card shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Admin Kobarapide</h1>
            <nav className="flex space-x-2 flex-wrap">
                <TabButton tab="stats" label="Tableau de Bord" />
                <TabButton tab="clients" label="Clients" />
                <TabButton tab="loans" label="Prêts" />
                <TabButton tab="waitingList" label="Listes d'attente" />
                <TabButton tab="duplicates" label="Doublons" />
                <TabButton tab="settings" label="Paramètres" />
                {loggedInUser.role === Role.SUPER_ADMIN && <TabButton tab="staff" label="Gérer Staff" />}
            </nav>
        </div>
      </header>
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;