import { DataProvider, useAppContext } from './context/DataContext';
import HomePage from './components/auth/HomePage';
import ClientDashboard from './components/client/ClientDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import LoadingSpinner from './components/shared/LoadingSpinner';

function AppContent() {
  const { loggedInUser, loading } = useAppContext();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-koba-bg">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loggedInUser) {
    return <HomePage />;
  }

  return (
    <div className="min-h-screen bg-koba-bg">
      <header className="bg-koba-card shadow-lg py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-2xl font-bold text-koba-accent">Kobarapide</h1>
          <div className="text-right">
            <p className="text-koba-text">{loggedInUser.prenom} {loggedInUser.nom}</p>
            <p className="text-sm text-gray-400">({loggedInUser.role})</p>
          </div>
        </div>
      </header>

      {['ADMIN', 'SUPER_ADMIN', 'MODERATEUR'].includes(loggedInUser.role) ? (
        <AdminDashboard />
      ) : (
        <ClientDashboard user={loggedInUser} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
