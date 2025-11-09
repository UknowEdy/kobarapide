import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import Card from '../shared/Card';
import { ClientStatus, LoanStatus, Role } from '../../types';
import { LOAN_STATUS_CONFIG } from '../../constants';
import { useAppContext } from '../../context/DataContext';


const DashboardStats: React.FC = () => {
    const { users, loans } = useAppContext();

    const totalClients = users.filter(u => u.role === Role.CLIENT).length;
    const activeClients = users.filter(u => u.status === ClientStatus.ACTIF && u.role === Role.CLIENT).length;
    const pendingLoansCount = loans.filter(l => l.status === LoanStatus.EN_ATTENTE).length;
    const totalLoanAmount = loans.reduce((sum, l) => sum + l.requestedAmount, 0);

    const loanStatusData = Object.values(LoanStatus).map(status => ({
        name: LOAN_STATUS_CONFIG[status].text,
        value: loans.filter(l => l.status === status).length,
    })).filter(item => item.value > 0);

    const PIE_COLORS: { [key in LoanStatus]?: string } = {
        [LoanStatus.DEBLOQUE]: '#22C55E', // green-500
        [LoanStatus.EN_ATTENTE]: '#EAB308', // yellow-500
        [LoanStatus.REMBOURSE]: '#A855F7', // purple-500
        [LoanStatus.DEFAUT]: '#EF4444', // red-500
        [LoanStatus.APPROUVE]: '#3B82F6', // blue-500
        [LoanStatus.REJETE]: '#71717A', // zinc-500
    };
    
    const totalRepaid = loans.flatMap(l => l.installments).reduce((sum, i) => sum + i.paidAmount, 0);
    const financialData = [
        { name: 'Finances', "Total Prêté": totalLoanAmount, "Total Remboursé": totalRepaid },
    ];

    const defaultedLoans = loans.filter(l => l.status === LoanStatus.DEFAUT);
    const activeOrCompletedLoans = loans.filter(l => [LoanStatus.DEBLOQUE, LoanStatus.REMBOURSE, LoanStatus.DEFAUT].includes(l.status));
    const defaultRate = activeOrCompletedLoans.length > 0 ? (defaultedLoans.length / activeOrCompletedLoans.length) * 100 : 0;
    
    const currentActiveLoanVolume = loans.filter(l => l.status === LoanStatus.DEBLOQUE).reduce((sum, l) => sum + l.netAmount, 0);
    const projectedLoss = currentActiveLoanVolume * (defaultRate / 100);

    let riskMessage;
    let riskColor;
    let RiskIcon = () => <span></span>;

    if (defaultRate > 20) {
        riskMessage = `Le taux de défaut élevé indique un risque financier critique. Des mesures immédiates sont nécessaires.`;
        riskColor = 'border-red-500/50 bg-red-900/20 text-red-300';
        RiskIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
    } else if (defaultRate > 5) {
        riskMessage = `Le taux de défaut est préoccupant. Surveillez attentivement les nouveaux prêts et les lignées à risque.`;
        riskColor = 'border-yellow-500/50 bg-yellow-900/20 text-yellow-300';
        RiskIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    } else {
        riskMessage = `Le taux de défaut est sous contrôle. Continuez la bonne gestion et la sélection rigoureuse des clients.`;
        riskColor = 'border-green-500/50 bg-green-900/20 text-green-300';
        RiskIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Total Clients"><p className="text-3xl font-bold text-gray-100">{totalClients}</p></Card>
                <Card title="Clients Actifs"><p className="text-3xl font-bold text-gray-100">{activeClients}</p></Card>
                <Card title="Prêts en Attente"><p className="text-3xl font-bold text-gray-100">{pendingLoansCount}</p></Card>
                <Card title="Montant Total Prêté"><p className="text-3xl font-bold text-gray-100">{totalLoanAmount.toLocaleString()}F</p></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card title="Répartition des Prêts" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={loanStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false}>
                                {loanStatusData.map((entry, index) => {
                                     const statusEnum = Object.keys(LOAN_STATUS_CONFIG).find(key => LOAN_STATUS_CONFIG[key as LoanStatus].text === entry.name) as LoanStatus;
                                     return <Cell key={`cell-${index}`} fill={PIE_COLORS[statusEnum] || '#8884d8'} />;
                                })}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#3a3632', borderColor: '#D97706', borderRadius: '0.5rem' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Flux Financiers Globaux" className="lg:col-span-3">
                     <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={financialData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#a1a1aa" tickLine={false} axisLine={false} />
                            <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} tickFormatter={(value) => `${(value/1000)}k F`} />
                            <Tooltip contentStyle={{ backgroundColor: '#3a3632', borderColor: '#D97706', borderRadius: '0.5rem' }} cursor={{ fill: 'rgba(217, 119, 6, 0.1)' }}/>
                            <Legend />
                            <Bar dataKey="Total Prêté" fill="#D97706" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Total Remboursé" fill="#22C55E" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
            <Card title="Analyse Prédictive des Risques">
                <div className={`p-4 rounded-lg border ${riskColor} flex items-start space-x-4`}>
                    <div className="flex-shrink-0">
                        <RiskIcon/>
                    </div>
                    <div>
                        <p className="font-semibold mb-1">{riskMessage}</p>
                        <div className="text-sm">
                            <span className="font-bold">Taux de défaut actuel : </span>{defaultRate.toFixed(1)}%
                            <br/>
                             <span className="font-bold">Perte potentielle projetée (sur prêts actifs) : </span>{projectedLoss.toLocaleString('fr-FR', {style: 'currency', currency: 'XOF'})}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default DashboardStats;
