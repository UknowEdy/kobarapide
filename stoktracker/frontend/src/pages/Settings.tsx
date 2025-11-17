import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import {
  User,
  LogOut,
  RefreshCw,
  Database,
  Wifi,
  WifiOff,
  Download,
  Info
} from 'lucide-react';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isOnline, pendingSync, manualSync } = useApp();

  const handleSync = async () => {
    const result = await manualSync();
    alert(result ? 'Synchronisation réussie' : 'Erreur de synchronisation');
  };

  const handleLogout = () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      logout();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Gérez votre compte et l'application</p>
        </div>

        {/* User Info */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{user?.name}</h3>
              {user?.businessName && (
                <p className="text-sm text-gray-600">{user.businessName}</p>
              )}
              <p className="text-sm text-gray-500">{user?.phone}</p>
            </div>
          </div>
        </Card>

        {/* Sync Status */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Synchronisation
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-600">En ligne</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-orange-600" />
                    <span className="text-sm text-orange-600">Hors ligne</span>
                  </>
                )}
              </div>

              {pendingSync > 0 && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                  {pendingSync} en attente
                </span>
              )}
            </div>

            <Button onClick={handleSync} variant="secondary" fullWidth>
              <RefreshCw className="w-4 h-4 mr-2" />
              Synchroniser maintenant
            </Button>
          </div>
        </Card>

        {/* App Info */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            À propos
          </h3>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Application</span>
              <span className="font-medium">StokTracker MVP</span>
            </div>
            <div className="flex justify-between">
              <span>Mode</span>
              <span className="font-medium">PWA</span>
            </div>
          </div>
        </Card>

        {/* Install PWA */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Installation
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Pour une meilleure expérience, installez StokTracker sur votre écran d'accueil.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              Sur Android/iOS: Ouvrez le menu du navigateur et sélectionnez "Ajouter à l'écran d'accueil"
            </p>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="danger"
            fullWidth
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pb-4">
          <p>StokTracker © 2024</p>
          <p className="mt-1">Gestion commerciale pour micro-entrepreneurs</p>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
