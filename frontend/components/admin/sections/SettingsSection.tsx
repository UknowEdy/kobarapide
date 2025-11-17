import { useState, useEffect } from 'react';
import { logout } from '../../../utils/api';

const SettingsSection = ({ isAdmin, isSuperAdmin }: { isAdmin: boolean; isSuperAdmin: boolean }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Settings pour limite de clients
  const [maxClients, setMaxClients] = useState(1000);
  const [currentClients, setCurrentClients] = useState(0);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://kobarapide.onrender.com';

  // Charger l'état actuel au montage
  // ADMIN et SUPER_ADMIN peuvent voir le mode maintenance
  useEffect(() => {
    if (isAdmin) {
      loadMaintenanceStatus();
      loadSettings();
      loadClientsCount();
    }
  }, [isAdmin]);

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

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        headers: {
          'x-auth-token': token || '',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setMaxClients(data.data.maxClients || 1000);
      }
    } catch (err) {
      console.error('Erreur chargement settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const loadClientsCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/clients-count`, {
        headers: {
          'x-auth-token': token || '',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setCurrentClients(data.data.current);
      }
    } catch (err) {
      console.error('Erreur chargement clients count:', err);
    }
  };

  const saveMaxClients = async () => {
    setSavingSettings(true);
    setSettingsMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ maxClients })
      });

      const data = await response.json();

      if (data.success) {
        setSettingsMessage('✅ Limite de clients mise à jour avec succès');
        setTimeout(() => setSettingsMessage(''), 5000);
      } else {
        setSettingsMessage('❌ Erreur lors de la mise à jour');
      }
    } catch (err) {
      console.error('Erreur save settings:', err);
      setSettingsMessage('❌ Erreur lors de la mise à jour');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Paramètres Système</h2>

      {/* Section Mode Maintenance - Visible pour ADMIN et SUPER_ADMIN */}
      {isAdmin && (
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
              <li>• Vous (Admin) gardez l'accès à l'administration</li>
              <li>• L'API reste accessible pour le monitoring</li>
              <li>• Le changement est instantané et persistant</li>
            </ul>
          </div>
        </div>
      )}

      {/* Section Limite de Clients - Visible pour ADMIN et SUPER_ADMIN */}
      {isAdmin && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Limite de Clients</h3>
          <p className="text-gray-400 text-sm mb-4">
            Définissez le nombre maximum de clients pouvant s'inscrire sur la plateforme.
          </p>

          {!loadingSettings ? (
            <>
              {/* Statistiques actuelles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">Clients Actuels</p>
                  <p className="text-2xl font-bold text-blue-500">{currentClients}</p>
                </div>
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">Limite Maximum</p>
                  <p className="text-2xl font-bold text-orange-500">{maxClients}</p>
                </div>
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">Places Disponibles</p>
                  <p className="text-2xl font-bold text-green-500">
                    {Math.max(0, maxClients - currentClients)}
                  </p>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Taux de remplissage</span>
                  <span>
                    {maxClients > 0 ? Math.round((currentClients / maxClients) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      currentClients >= maxClients
                        ? 'bg-red-500'
                        : currentClients / maxClients > 0.8
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${maxClients > 0 ? Math.min((currentClients / maxClients) * 100, 100) : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Input pour modifier la limite */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Nouvelle limite de clients
                  </label>
                  <input
                    type="number"
                    value={maxClients}
                    onChange={(e) => setMaxClients(parseInt(e.target.value) || 0)}
                    min="0"
                    step="10"
                    className="w-full md:w-64 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={saveMaxClients}
                  disabled={savingSettings}
                  className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold ${
                    savingSettings ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {savingSettings ? 'Enregistrement...' : 'Sauvegarder'}
                </button>

                {settingsMessage && (
                  <div
                    className={`p-3 rounded ${
                      settingsMessage.includes('❌') ? 'bg-red-600' : 'bg-green-600'
                    } text-white`}
                  >
                    {settingsMessage}
                  </div>
                )}
              </div>

              {/* Info supplémentaire */}
              <div className="mt-4 p-4 bg-gray-900 rounded border border-gray-700">
                <p className="text-xs text-gray-400">
                  <strong>ℹ️ Information :</strong>
                  <br />
                  Cette limite s'applique uniquement aux nouveaux clients.
                </p>
                <ul className="text-xs text-gray-400 mt-2 space-y-1 ml-4">
                  <li>• Les clients existants ne sont pas affectés</li>
                  <li>• La création manuelle de clients par les admins est soumise à cette limite</li>
                  <li>• Les inscriptions seront bloquées si la limite est atteinte</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}
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
