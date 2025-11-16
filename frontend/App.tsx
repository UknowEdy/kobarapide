import { useAppContext } from './context/DataContext';
import HomePage from './components/auth/HomePage';
import VerifyEmail from './components/auth/VerifyEmail';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AdminDashboard from './components/admin/AdminDashboard';
import ClientDashboard from './components/client/ClientDashboard';
import LoadingSpinner from './components/shared/LoadingSpinner';

export default function App() {
  const { loggedInUser, loading } = useAppContext();

  // Simple routing based on URL path
  const path = window.location.pathname;

  // Handle public routes (email verification, password reset)
  if (path === '/verify-email') {
    return <VerifyEmail />;
  }

  if (path === '/forgot-password') {
    return <ForgotPassword />;
  }

  if (path === '/reset-password') {
    return <ResetPassword />;
  }

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