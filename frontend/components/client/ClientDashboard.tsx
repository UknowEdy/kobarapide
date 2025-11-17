import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/DataContext';

export default function ClientDashboard() {
  const { loggedInUser, logout } = useAppContext();
  const [darkMode, setDarkMode] = useState(true);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDemandePret, setShowDemandePret] = useState(false);
  const [loanAmount, setLoanAmount] = useState(5000); // Montant par défaut

  const API_URL = import.meta.env.VITE_API_URL || 'https://kobarapide.onrender.com';

  // Fonction pour calculer le montant maximum selon le score
  const getMaxLoanAmount = (score: number) => {
    if (score >= 0 && score <= 3) return 5000;
    if (score >= 4 && score <= 6) return 10000;
    if (score >= 7 && score <= 9) return 15000;
    if (score === 10) return 20000;
    return 0;
  };

  // Fonction pour obtenir la couleur du score
  const getScoreColor = (score: number) => {
    if (score >= 0 && score <= 3) return 'text-red-500';
    if (score >= 4 && score <= 6) return 'text-orange-500';
    if (score >= 7 && score <= 9) return 'text-green-400';
    if (score === 10) return 'text-green-600';
    return 'text-gray-500';
  };

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
    console.log('\n🚀 ===== SOUMISSION DEMANDE DE PRÊT =====');

    const formData = new FormData(e.currentTarget);
    const montant = Number(formData.get('montant'));
    const raison = formData.get('raison');
    const score = loggedInUser?.score || 0;
    const maxMontant = getMaxLoanAmount(score);

    console.log('📊 Données du formulaire:');
    console.log('  - Montant:', montant);
    console.log('  - Raison:', raison);
    console.log('  - Score utilisateur:', score);
    console.log('  - Max autorisé:', maxMontant);
    console.log('  - User ID:', loggedInUser?._id);

    // Validation : montant doit être un multiple de 5000
    if (montant % 5000 !== 0) {
      console.log('❌ Validation échouée: montant pas un multiple de 5000');
      alert('⚠️ Le montant doit être un multiple de 5 000 F');
      return;
    }

    // Validation : montant ne doit pas dépasser le maximum autorisé
    if (montant > maxMontant) {
      console.log('❌ Validation échouée: montant dépasse le maximum');
      alert(`⚠️ Votre score (${score}) permet un prêt maximum de ${maxMontant.toLocaleString()} F`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token présent:', token ? 'Oui' : 'Non');

      // ✅ CORRECTION: Le backend utilise req.user.id du token JWT, pas de userId dans le body
      // ✅ Utiliser requestedAmount et loanPurpose (noms anglais cohérents)
      const payload = {
        requestedAmount: montant,
        loanPurpose: raison
      };

      console.log('📦 Payload envoyé:', payload);
      console.log('🌐 URL:', `${API_URL}/api/loans`);

      const response = await fetch(`${API_URL}/api/loans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || ''
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Statut réponse:', response.status, response.statusText);

      const data = await response.json();
      console.log('📨 Réponse serveur:', data);

      if (response.ok) {
        console.log('✅ Demande créée avec succès!');
        alert('✅ Demande de prêt soumise avec succès!');
        e.currentTarget.reset();
        setLoanAmount(5000); // Reset au montant par défaut
        setShowDemandePret(false);
        fetchMyLoans();
      } else {
        console.log('❌ Erreur retournée par le serveur:', data.msg);
        alert(`❌ ${data.msg || 'Erreur lors de la demande'}`);
      }
    } catch (error) {
      console.error('❌ ERREUR CATCH:', error);
      alert('❌ Erreur serveur');
    } finally {
      console.log('========================================\n');
    }
  };

  const activeLoan = loans.find(l => l.statut === 'DEBLOQUE' || l.statut === 'APPROUVE');
  const loanHistory = loans.filter(l => l.statut === 'REMBOURSE');
  const userScore = loggedInUser?.score || 0;
  const maxLoanAmount = getMaxLoanAmount(userScore);
  const scoreColor = getScoreColor(userScore);

  // Calculer les frais et le montant net pour l'affichage
  const fees = loanAmount * 0.05;
  const netAmount = loanAmount - fees;

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
            <p className={`text-4xl font-bold ${scoreColor}`}>{userScore}</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>sur 10</p>
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
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{activeLoan.raison || 'Achat matériel'}</span>
                    <span className="font-bold">{activeLoan.montant?.toLocaleString()}F</span>
                  </div>

                  {/* Progress Bar */}
                  <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                      style={{ width: `${activeLoan.montantRembourse / activeLoan.montant * 100 || 0}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {activeLoan.montantRembourse || 0}% remboursé
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
                        <td className="py-3 text-sm">{new Date(loan.dateCreation).toLocaleDateString()}</td>
                        <td className="py-3 text-sm">{loan.montant?.toLocaleString()}F</td>
                        <td className="py-3 text-sm">{loan.raison}</td>
                        <td className="py-3">
                          <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">
                            {loan.statut}
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

            {/* Info Score et Montant Max */}
            <div className={`p-3 mb-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Votre score :</span>
                <span className={`font-bold ${scoreColor}`}>{userScore}/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Montant maximum :</span>
                <span className="font-bold text-blue-500">{maxLoanAmount.toLocaleString()} F</span>
              </div>
            </div>

            <form onSubmit={handleLoanRequest} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm">Montant (multiples de 5 000 F uniquement)</label>
                <input
                  type="number"
                  name="montant"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  required
                  min="5000"
                  max={maxLoanAmount}
                  step="5000"
                  className={`w-full p-3 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>

              {/* Affichage des frais et montant net */}
              <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-sm space-y-1`}>
                <div className="flex justify-between">
                  <span>Montant demandé :</span>
                  <span className="font-bold">{loanAmount.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Frais de dossier (5%) :</span>
                  <span className="font-bold">- {fees.toLocaleString()} F</span>
                </div>
                <div className={`flex justify-between pt-2 border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  <span className="font-bold">Montant à recevoir :</span>
                  <span className="font-bold text-green-500">{netAmount.toLocaleString()} F</span>
                </div>
              </div>

              {/* Info sur le système de remboursement */}
              <div className={`p-3 rounded ${darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-50'} text-sm`}>
                <p className="font-bold mb-2 text-blue-500">📅 Calendrier de Remboursement</p>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>1ère tranche (50%)</strong> : 30 jours après déblocage</li>
                  <li>• <strong>2ème tranche (50%)</strong> : 60 jours après déblocage</li>
                </ul>
              </div>

              <div>
                <label className="block mb-2 text-sm">Raison du prêt</label>
                <textarea
                  name="raison"
                  required
                  rows={3}
                  placeholder="Expliquez brièvement l'utilisation des fonds..."
                  className={`w-full p-3 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDemandePret(false);
                    setLoanAmount(5000);
                  }}
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
