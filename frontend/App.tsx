import { useState, useEffect } from 'react';
import { useAppContext } from './context/DataContext';
import HomePage from './components/auth/HomePage';
import AdminDashboard from './components/admin/AdminDashboard';
import ClientDashboard from './components/client/ClientDashboard';
import LoadingSpinner from './components/shared/LoadingSpinner';
import MaintenanceMode from './components/shared/MaintenanceMode';

export default function App() {
  const { loggedInUser, loading } = useAppContext();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'https://kobarapide.onrender.com';

  // Vérifier le mode maintenance au démarrage
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();

        if (data.maintenance === true || data.status === 'maintenance') {
          setMaintenanceMode(true);
        }
      } catch (error) {
        console.log('Vérification maintenance échouée:', error);
        // En cas d'erreur réseau, on ne bloque pas l'app
      } finally {
        setCheckingMaintenance(false);
      }
    };

    checkMaintenance();
  }, [API_URL]);

  // Afficher un loader pendant la vérification de maintenance
  if (checkingMaintenance || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-koba-bg">
        <LoadingSpinner />
      </div>
    );
  }

  // Si le mode maintenance est activé, afficher la page de maintenance
  if (maintenanceMode) {
    return <MaintenanceMode />;
  }

  // Non loggato → HomePage
  if (!loggedInUser) {
    return <HomePage />;
  }

  // Loggato come CLIENT → ClientDashboard
  if (loggedInUser.role === 'CLIENT') {
    return <ClientDashboard />;
  }

  // Loggato come ADMIN/SUPER_ADMIN → AdminDashboard
  return <AdminDashboard />;
}