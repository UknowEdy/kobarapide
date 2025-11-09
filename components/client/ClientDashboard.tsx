import React, { useState, useEffect } from 'react';
// FIX: Imported ClientStatus to resolve reference error.
import { User, LoanApplication, LoanStatus, InstallmentStatus, ClientStatus } from '../../types';
import { getLoanLimitForScore } from '../../constants';
import Card from '../shared/Card';
import { CLIENT_STATUS_CONFIG, LOAN_STATUS_CONFIG } from '../../constants';
import StatusBadge from '../shared/StatusBadge';
import { NotificationManager } from '../../utils/NotificationManager';
import Toast from '../shared/Toast';
import { useAppContext } from '../../context/DataContext';
import LoanRequestModal from './LoanRequestModal';
import PaymentModal from './PaymentModal';
import ClientStatsModal from './ClientStatsModal';


interface ClientDashboardProps {
  user: User;
  loans: LoanApplication[];
}

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div className="bg-koba-accent h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
    </div>
);

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, loans }) => {
  const { requestUnblocking } = useAppContext();
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoanRequestModalOpen, setIsLoanRequestModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [paymentModalLoan, setPaymentModalLoan] = useState<LoanApplication | null>(null);

  const userStatus = CLIENT_STATUS_CONFIG[user.status];
  const maxLoanAmount = getLoanLimitForScore(user.score);
  const activeLoans = loans.filter(l => l.status === LoanStatus.DEBLOQUE);
  const loanHistory = loans.filter(l => l.status !== LoanStatus.DEBLOQUE);

  useEffect(() => {
    NotificationManager.registerServiceWorker();
    if (loans.length > 0 && notificationPermission === 'granted') {
        NotificationManager.scheduleLoanNotifications(loans);
    }
  }, [loans, notificationPermission]);

  const handleEnableNotifications = async () => {
    const permission = await NotificationManager.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
        NotificationManager.scheduleLoanNotifications(loans);
        setToastMessage("Vos rappels d'échéances ont été activés !");
    }
  };
  
  const handleShareCode = async () => {
    if (user.codeParrainage) {
        const shareData = {
            title: 'Rejoignez Kobarapide !',
            text: `Utilisez mon code de parrainage pour vous inscrire sur Kobarapide : ${user.codeParrainage}`,
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.text);
                setToastMessage('Code de parrainage copié dans le presse-papiers !');
            }
        } catch (err) {
            console.error('Erreur de partage:', err);
            await navigator.clipboard.writeText(shareData.text);
            setToastMessage('Code de parrainage copié dans le presse-papiers !');
        }
    }
  };
  
  const handleRequestUnblocking = async () => {
    const result = await requestUnblocking(user._id);
    if (result.success) {
        setToastMessage(result.message);
    } else {
        setToastMessage("Une erreur est survenue.");
    }
  }

  const calculateProgress = (loan: LoanApplication) => {
    const totalPaid = loan.installments.reduce((sum, inst) => sum + inst.paidAmount, 0);
    const totalDue = loan.installments.reduce((sum, inst) => sum + inst.dueAmount, 0);
    return totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;
  };

  return (
    <>
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        
        {notificationPermission === 'default' && (
          <div className="bg-blue-900/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <p className="text-blue-200 text-center sm:text-left">Activez les notifications pour recevoir des rappels sur vos échéances.</p>
              <button onClick={handleEnableNotifications} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors whitespace-nowrap">
                  Activer
              </button>
          </div>
        )}
        {notificationPermission === 'denied' && (
            <div className="bg-red-900/50 p-3 rounded-lg text-sm">
              <p className="text-red-200">Les notifications sont bloquées. Vous pouvez les réactiver dans les paramètres de votre navigateur pour recevoir des rappels importants.</p>
          </div>
        )}

        <header className="text-center">
          <h1 className="text-3xl font-bold text-white">Bonjour, {user.prenom}</h1>
          <p className="text-gray-400">Bienvenue sur votre tableau de bord Kobarapide.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Votre Score">
              <p className="text-4xl font-bold text-koba-accent">{user.score}</p>
          </Card>
          <Card title="Statut du Compte">
              <StatusBadge text={userStatus.text} color={userStatus.color} />
          </Card>
          <Card title="Montant Max. Prêt">
              <p className="text-3xl font-bold text-gray-100">{maxLoanAmount.toLocaleString()}F</p>
          </Card>
          <Card title="Code Parrainage">
              {user.codeParrainage ? <p className="text-2xl font-mono bg-koba-bg p-2 rounded text-center">{user.codeParrainage}</p> : <p className="text-gray-400">Non disponible</p>}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="Prêts en Cours">
              {activeLoans.length > 0 ? (
                <ul className="space-y-4">
                  {activeLoans.map(loan => (
                    <li key={loan._id} className="p-4 border border-gray-700 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">{loan.loanPurpose}</span>
                          <span className="text-gray-100 font-bold">{(loan.requestedAmount).toLocaleString()}F</span>
                      </div>
                      <ProgressBar value={calculateProgress(loan)} />
                      <div className="text-right text-sm text-gray-400 mt-1">{Math.round(calculateProgress(loan))}% remboursé</div>
                      <div className="mt-4 flex justify-end">
                          <button onClick={() => setPaymentModalLoan(loan)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">
                              Payer une échéance
                          </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-400">Vous n'avez aucun prêt en cours.</p>}
            </Card>
          </div>

          <div>
              <Card title="Actions Rapides">
                  <div className="flex flex-col space-y-3">
                      <button onClick={() => setIsLoanRequestModalOpen(true)} className="w-full bg-koba-accent hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={maxLoanAmount <= 0}>
                          Faire une demande de prêt
                      </button>
                      <button onClick={() => setIsStatsModalOpen(true)} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors">
                          Voir mes statistiques
                      </button>
                      {user.codeParrainage && <button onClick={handleShareCode} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition-colors">Partager mon code</button>}
                      {user.status === ClientStatus.BLOQUE && <button onClick={handleRequestUnblocking} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">Demander un déblocage</button>}
                  </div>
              </Card>
          </div>
        </div>
        
         <Card title="Historique des Prêts">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700/50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Montant</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Objet</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Statut</th>
                      </tr>
                  </thead>
                  <tbody className="bg-koba-card divide-y divide-gray-700">
                      {loanHistory.map(loan => (
                          <tr key={loan._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(loan.createdAt).toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{loan.requestedAmount.toLocaleString()}F</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{loan.loanPurpose}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <StatusBadge text={LOAN_STATUS_CONFIG[loan.status].text} color={LOAN_STATUS_CONFIG[loan.status].color} />
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
         </Card>
      </div>
      {isLoanRequestModalOpen && <LoanRequestModal user={user} maxLoanAmount={maxLoanAmount} onClose={() => setIsLoanRequestModalOpen(false)} showToast={setToastMessage} />}
      {isStatsModalOpen && <ClientStatsModal loans={loans} onClose={() => setIsStatsModalOpen(false)} />}
      {paymentModalLoan && <PaymentModal loan={paymentModalLoan} onClose={() => setPaymentModalLoan(null)} showToast={setToastMessage} />}
    </>
  );
};

export default ClientDashboard;