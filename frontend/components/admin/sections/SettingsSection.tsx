import { logout } from '../../../utils/api';
const SettingsSection = () => {
  return (
    <div className="bg-gray-800 p-6 rounded">
      <h3 className="text-xl font-bold mb-4">Paramètres</h3>
      <button onClick={() => logout()} className="px-4 py-2 bg-red-600 text-white rounded">Déconnexion</button>
    </div>
  );
};
export default SettingsSection;
