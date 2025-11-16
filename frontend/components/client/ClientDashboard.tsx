import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/DataContext';

export default function ClientDashboard() {
  const { loggedInUser, logout } = useAppContext();
  const [darkMode, setDarkMode] = useState(true);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDemandePret, setShowDemandePret] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://kobarapide.onrender.com';

  useEffect(() => {
    fetchMyLoans();
  }, []);

  const fetchMyLoans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/loans?userId=${loggedInUser?._id}`, {
        headers: { 'x-auth-token': token || '' }
      });
      const data = await response.json();
      setLoans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/loans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || ''
        },
        body: JSON.stringify({
          userId: loggedInUser?._id,
          requestedAmount: Number(formData.get('montant')),
          loanPurpose: formData.get('raison')
        })
      });

      if (response.ok) {
        alert('✅ Demande de prêt soumise avec succès!');
        e.currentTarget.reset();
        setShowDemandePret(false);
        fetchMyLoans();
      } else {
        alert('❌ Erreur lors de la demande');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Erreur serveur');
    }
  };

  const activeLoan = loans.find(l => l.status === 'DEBLOQUE' || l.status === 'APPROUVE');
  const loanHistory = loans.filter(l => l.status === 'REMBOURSE');
  const maxLoanAmount = 10000;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-4`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/icon-192x192.png" alt="Kobarapide" className="w-10 h-10" />
            <h1 className="text-xl font-bold">Kobarapide</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Toggle Dark/Light Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            
            {/* View Toggle */}
            <div className="flex gap-2 text-sm">
              <span className={`px-3 py-1 rounded ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white cursor-pointer`}>
                Client ({loggedInUser?.prenom})
              </span>
              {loggedInUser?.role !== 'CLIENT' && (
                <span className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} cursor-pointer`}>
                  Admin
                </span>
              )}
            </div>

            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white text-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* Welcome Message */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Bonjour, {loggedInUser?.prenom}</h2>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Bienvenue sur votre tableau de bord Kobarapide.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Score */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Votre Score</p>
            <p className="text-4xl font-bold text-blue-500">{loggedInUser?.score || 0}</p>
          </div>

          {/* Status */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Statut du Compte</p>
            <span className={`px-3 py-1 rounded text-sm font-semibold ${
              loggedInUser?.status === 'ACTIF' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
            }`}>
              {loggedInUser?.status || 'EN_ATTENTE'}
            </span>
          </div>

          {/* Max Loan */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Montant Max. Prêt</p>
            <p className="text-2xl font-bold">{maxLoanAmount.toLocaleString()}F</p>
          </div>

          {/* Referral Code */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Code Parrainage</p>
            <p className="text-2xl font-bold">{loggedInUser?.codeParrainage || 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Active Loan */}
          <div className="lg:col-span-2">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
              <h3 className="text-xl font-bold mb-4">Prêts en Cours</h3>
              
              {activeLoan ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{activeLoan.loanPurpose || 'Achat matériel'}</span>
                    <span className="font-bold">{activeLoan.requestedAmount?.toLocaleString()}F</span>
                  </div>

                  {/* Progress Bar */}
                  <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                      style={{ width: `${activeLoan.installments ? (activeLoan.installments.filter((i: any) => i.status === 'PAYEE').length / activeLoan.installments.length * 100) : 0}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {activeLoan.installments ? activeLoan.installments.filter((i: any) => i.status === 'PAYEE').length : 0} / {activeLoan.installments?.length || 0} échéances payées
                    </span>
                  </div>

                  <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg">
                    Payer une échéance
                  </button>
                </div>
              ) : (
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Aucun prêt actif</p>
              )}
            </div>

            {/* Loan History */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow mt-6`}>
              <h3 className="text-xl font-bold mb-4">Historique des Prêts</h3>
              
              {loanHistory.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className="text-left py-2 text-sm">DATE</th>
                      <th className="text-left py-2 text-sm">MONTANT</th>
                      <th className="text-left py-2 text-sm">OBJET</th>
                      <th className="text-left py-2 text-sm">STATUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loanHistory.map(loan => (
                      <tr key={loan._id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="py-3 text-sm">{new Date(loan.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 text-sm">{loan.requestedAmount?.toLocaleString()}F</td>
                        <td className="py-3 text-sm">{loan.loanPurpose}</td>
                        <td className="py-3">
                          <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">
                            {loan.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Aucun historique</p>
              )}
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
              <h3 className="text-xl font-bold mb-4">Actions Rapides</h3>
              
              <button
                onClick={() => setShowDemandePret(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg mb-3"
              >
                Faire une demande de prêt
              </button>
              
              <button className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-bold py-3 rounded-lg mb-3`}>
                Voir mes statistiques
              </button>
              
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-lg">
                Partager mon code
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Demande de Prêt */}
      {showDemandePret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
            <h3 className="text-2xl font-bold mb-4">Demander un Prêt</h3>
            <form onSubmit={handleLoanRequest} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm">Montant (F)</label>
                <input
                  type="number"
                  name="montant"
                  required
                  min="100"
                  max={maxLoanAmount}
                  className={`w-full p-3 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm">Raison</label>
                <textarea
                  name="raison"
                  required
                  rows={3}
                  className={`w-full p-3 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDemandePret(false)}
                  className={`flex-1 py-3 rounded font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-bold"
                >
                  Soumettre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}