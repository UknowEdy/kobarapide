import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline, pendingSync, manualSync } = useApp();
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/products', icon: Package, label: 'Produits' },
    { path: '/sell', icon: ShoppingCart, label: 'Vendre' },
    { path: '/reports', icon: BarChart3, label: 'Rapports' },
    { path: '/settings', icon: Settings, label: 'Paramètres' }
  ];

  const handleSync = async () => {
    await manualSync();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">StokTracker</h1>
              {user?.businessName && (
                <p className="text-xs text-primary-100">{user.businessName}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Bouton de synchronisation */}
              <button
                onClick={handleSync}
                className="p-2 hover:bg-primary-700 rounded-lg transition"
                title="Synchroniser"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Indicateur de connexion */}
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-green-300" />
                ) : (
                  <WifiOff className="w-5 h-5 text-orange-300" />
                )}
                {pendingSync > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingSync}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1 transition ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-primary-500'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
