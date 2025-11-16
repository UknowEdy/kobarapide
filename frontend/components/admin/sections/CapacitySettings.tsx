import { useState, useEffect } from 'react';
import { fetchGET, fetchPUT } from '../../../utils/api';
import LoadingSpinner from '../../shared/LoadingSpinner';

interface CapacityConfig {
  _id: string;
  totalCapacity: number;
  currentUsage: number;
  autoIncrease: boolean;
  increaseThreshold: number;
  increaseAmount: number;
  lastUpdated: string;
}

export default function CapacitySettings() {
  const [config, setConfig] = useState<CapacityConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [totalCapacity, setTotalCapacity] = useState(100);
  const [autoIncrease, setAutoIncrease] = useState(false);
  const [increaseThreshold, setIncreaseThreshold] = useState(90);
  const [increaseAmount, setIncreaseAmount] = useState(20);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchGET('/api/capacity');
      if (res.success && res.data) {
        setConfig(res.data);
        setTotalCapacity(res.data.totalCapacity);
        setAutoIncrease(res.data.autoIncrease);
        setIncreaseThreshold(res.data.increaseThreshold);
        setIncreaseAmount(res.data.increaseAmount);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetchPUT('/api/capacity', {
        totalCapacity,
        autoIncrease,
        increaseThreshold,
        increaseAmount
      });

      if (res.success) {
        setSuccess('Configuration sauvegardée avec succès !');
        loadConfig();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.message || res.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-koba-card p-6 rounded-lg">
        <h3 className="text-xl font-bold text-koba-accent mb-4">⚙️ Gestion de la capacité</h3>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const usagePercentage = config ? Math.round((config.currentUsage / config.totalCapacity) * 100) : 0;

  return (
    <div className="bg-koba-card p-6 rounded-lg">
      <h3 className="text-xl font-bold text-koba-accent mb-4">⚙️ Gestion de la capacité</h3>

      {error && (
        <div className="bg-red-600 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-600 text-white p-3 rounded mb-4">
          {success}
        </div>
      )}

      {config && (
        <div className="mb-6 p-4 bg-koba-bg rounded">
          <h4 className="text-koba-accent font-semibold mb-3">Utilisation actuelle</h4>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-koba-text">
              {config.currentUsage} / {config.totalCapacity} utilisateurs actifs
            </span>
            <span className={`font-bold ${usagePercentage >= 90 ? 'text-red-500' : usagePercentage >= 70 ? 'text-yellow-500' : 'text-green-500'}`}>
              {usagePercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all ${usagePercentage >= 90 ? 'bg-red-500' : usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Dernière mise à jour: {new Date(config.lastUpdated).toLocaleString('fr-FR')}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-koba-text mb-2">Capacité totale</label>
          <input
            type="number"
            value={totalCapacity}
            onChange={(e) => setTotalCapacity(Number(e.target.value))}
            min="1"
            className="w-full p-3 bg-koba-bg text-koba-text rounded border border-koba-accent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Nombre maximum d'utilisateurs actifs simultanément
          </p>
        </div>

        <div className="p-4 bg-koba-bg rounded border border-koba-accent">
          <div className="flex items-center justify-between mb-3">
            <label className="text-koba-text font-semibold">Augmentation automatique</label>
            <button
              type="button"
              onClick={() => setAutoIncrease(!autoIncrease)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoIncrease ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoIncrease ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Augmenter automatiquement la capacité lorsque le seuil est atteint
          </p>

          {autoIncrease && (
            <div className="space-y-3 pt-3 border-t border-gray-700">
              <div>
                <label className="block text-koba-text mb-2 text-sm">
                  Seuil de déclenchement (%)
                </label>
                <input
                  type="number"
                  value={increaseThreshold}
                  onChange={(e) => setIncreaseThreshold(Number(e.target.value))}
                  min="50"
                  max="100"
                  className="w-full p-2 bg-koba-bg text-koba-text rounded border border-gray-600 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Déclenche l'augmentation à {increaseThreshold}% d'utilisation
                </p>
              </div>

              <div>
                <label className="block text-koba-text mb-2 text-sm">
                  Montant d'augmentation
                </label>
                <input
                  type="number"
                  value={increaseAmount}
                  onChange={(e) => setIncreaseAmount(Number(e.target.value))}
                  min="1"
                  className="w-full p-2 bg-koba-bg text-koba-text rounded border border-gray-600 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Ajouter {increaseAmount} places supplémentaires lors de l'augmentation
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-koba-accent text-koba-bg font-bold py-3 rounded hover:opacity-80 disabled:opacity-50 flex justify-center items-center"
        >
          {saving ? <LoadingSpinner /> : 'Sauvegarder la configuration'}
        </button>
      </div>
    </div>
  );
}
