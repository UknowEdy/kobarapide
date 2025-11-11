import { useAppContext } from './context/DataContext';
import HomePage from './components/auth/HomePage';
import AdminDashboard from './components/admin/AdminDashboard';
import ClientDashboard from './components/client/ClientDashboard';
import LoadingSpinner from './components/shared/LoadingSpinner';

export default function App() {
  const { loggedInUser, loading } = useAppContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-koba-bg">
        <LoadingSpinner />
      </div>
    );
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