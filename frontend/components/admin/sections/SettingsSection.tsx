import { useState, useEffect } from 'react';
import { logout } from '../../../utils/api';

const SettingsSection = ({ isSuperAdmin }: { isSuperAdmin: boolean }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'https://kobarapide.onrender.com';

  // Charger l'état actuel au montage
  useEffect(() => {
    if (isSuperAdmin) {
      loadMaintenanceStatus();
    }
  }, [isSuperAdmin]);

  const loadMaintenanceStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/maintenance-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setMaintenanceMode(data.maintenanceMode);
      }
    } catch (err) {
      console.error('Erreur chargement statut maintenance:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const toggleMaintenance = async () => {
    const confirmMessage = maintenanceMode
      ? 'Désactiver le mode maintenance ? Le site redeviendra accessible aux clients.'
      : 'Activer le mode maintenance ? Les clients verront une page "Site en maintenance".';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/toggle-maintenance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enable: !maintenanceMode })
      });

      const data = await response.json();

      if (data.success) {
        setMaintenanceMode(!maintenanceMode);
        setMessage(data.msg);

        // Message disparaît après 5 secondes
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage('❌ Erreur lors du changement de statut');
      }
    } catch (err) {
      console.error('Erreur toggle maintenance:', err);
      setMessage('❌ Erreur lors du changement de statut');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Paramètres Système</h2>

      {/* Section Mode Maintenance - Visible uniquement pour SUPER_ADMIN */}
      {isSuperAdmin && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Mode Maintenance</h3>
              <p className="text-gray-400 text-sm">
                Activez le mode maintenance pour afficher une page d'information pendant les mises à jour.
              </p>
            </div>

            {/* Toggle Switch */}
            {!loadingStatus && (
              <button
                onClick={toggleMaintenance}
                disabled={loading}
                className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                  maintenanceMode ? 'bg-orange-500' : 'bg-gray-600'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-10 w-10 transform rounded-full bg-white transition-transform ${
                    maintenanceMode ? 'translate-x-12' : 'translate-x-1'
                  }`}
                />
              </button>
            )}

            {loadingStatus && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            )}
          </div>

          {/* Statut actuel */}
          {!loadingStatus && (
            <div className="flex items-center gap-2 mt-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  maintenanceMode ? 'bg-orange-500 animate-pulse' : 'bg-green-500'
                }`}
              ></div>
              <span className="text-sm font-semibold text-white">
                {maintenanceMode ? '🔧 Mode maintenance ACTIVÉ' : '✅ Site en ligne'}
              </span>
            </div>
          )}

          {/* Message de confirmation */}
          {message && (
            <div
              className={`mt-4 p-3 rounded ${
                message.includes('❌') ? 'bg-red-600' : 'bg-green-600'
              } text-white`}
            >
              {message}
            </div>
          )}

          {/* Info supplémentaire */}
          <div className="mt-4 p-4 bg-gray-900 rounded border border-gray-700">
            <p className="text-xs text-gray-400">
              <strong>ℹ️ Information :</strong>
              <br />
              Quand le mode maintenance est activé :
            </p>
            <ul className="text-xs text-gray-400 mt-2 space-y-1 ml-4">
              <li>• Les clients voient une page "Site en maintenance"</li>
              <li>• Vous (Super Admin) gardez l'accès à l'administration</li>
              <li>• L'API reste accessible pour le monitoring</li>
              <li>• Le changement est instantané et persistant</li>
            </ul>
          </div>
        </div>
      )}

      {/* Section Déconnexion */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Compte</h3>
        <button
          onClick={() => logout()}
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default SettingsSection;
