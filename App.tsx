import React from 'react';
import AdminDashboard from './components/admin/AdminDashboard';
import ClientDashboard from './components/client/ClientDashboard';
import LoadingSpinner from './components/shared/LoadingSpinner';
import HomePage from './components/auth/HomePage';
import { Role } from './types';
import { useAppContext } from './context/DataContext';

const App: React.FC = () => {
  const { 
    loans, 
    loading, 
    isUpdating, 
    loggedInUser,
    logout,
  } = useAppContext();
  
  if (loading) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-koba-bg">
            <img src="/logo.png" alt="Kobarapide Logo" className="w-32 h-32 mx-auto" />
            <LoadingSpinner />
            <p className="text-gray-400">Chargement en cours...</p>
        </div>
    );
  }

  if (!loggedInUser) {
    return <HomePage />;
  }
  
  const clientLoans = loans.filter(loan => loan.userId === loggedInUser._id);

  const renderDashboard = () => {
    switch(loggedInUser.role) {
      case Role.CLIENT:
        return <ClientDashboard user={loggedInUser} loans={clientLoans} />;
      case Role.ADMIN:
      case Role.SUPER_ADMIN:
      case Role.MODERATEUR:
        return <AdminDashboard />;
      default:
        return <div className="p-8 text-center text-red-400">Rôle utilisateur non reconnu.</div>;
    }
  }

  return (
    <div className="min-h-screen relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-koba-bg bg-opacity-80 flex justify-center items-center z-50">
            <LoadingSpinner />
        </div>
      )}
       <header className="py-4 bg-koba-card shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
            <img src="/logo.png" alt="Kobarapide Logo" className="w-24 h-24" />
            <div className="text-right">
              <p className="text-white">Connecté en tant que: <span className="font-bold">{loggedInUser.prenom} {loggedInUser.nom}</span></p>
              <p className="text-sm text-gray-400">({loggedInUser.role})</p>
              <button
                onClick={logout}
                className="mt-2 px-3 py-1 text-sm rounded transition-colors bg-red-600 hover:bg-red-700 text-white"
              >
                Déconnexion
              </button>
            </div>
          </div>
      </header>
      
      {renderDashboard()}

    </div>
  );
};

export default App;