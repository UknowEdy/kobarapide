import { logout } from '../../../utils/api';
import CapacitySettings from './CapacitySettings';

const SettingsSection = () => {
  return (
    <div className="space-y-6">
      <CapacitySettings />

      <div className="bg-koba-card p-6 rounded-lg">
        <h3 className="text-xl font-bold text-koba-accent mb-4">Compte</h3>
        <button
          onClick={() => logout()}
          className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
};
export default SettingsSection;
