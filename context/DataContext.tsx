import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, LoanApplication, WaitingListItem, ClientStatus, LoanStatus, Role, PotentialDuplicate, DataContextType, CapacityConfig, Installment, InstallmentStatus } from '../types';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useAppContext = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useAppContext must be used within a DataProvider');
    }
    return context;
};

// Expose verification function to window for easy testing from console
declare global {
  interface Window {
    verifyUserEmail: (userId: string) => void;
  }
}

const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;
const today = new Date();
const daysAgo = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const daysLater = (days: number) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

const initialUsers: User[] = [
  { _id: 'user1', email: 'jean.dupont@email.com', password: 'password123', isEmailVerified: true, nom: 'Dupont', prenom: 'Jean', telephone: '0612345678', pieceIdentite: 'ID123', dateDeNaissance: '1985-05-15', photoUrl: 'https://i.pravatar.cc/150?u=user1', selfieIdUrl: 'https://i.pravatar.cc/300?u=selfie1', score: 5, status: ClientStatus.ACTIF, role: Role.CLIENT, filleuls: ['user4'], nombrePretsRembourses: 2, dateInscription: daysAgo(100), dateActivation: daysAgo(98), dateDerniereActivite: daysAgo(5), createdAt: daysAgo(100), updatedAt: daysAgo(5), codeParrainage: 'JEAN123' },
  { _id: 'user2', email: 'marie.curie@email.com', password: 'password123', isEmailVerified: true, nom: 'Curie', prenom: 'Marie', telephone: '0687654321', pieceIdentite: 'ID456', dateDeNaissance: '1990-11-20', photoUrl: 'https://i.pravatar.cc/150?u=user2', selfieIdUrl: 'https://i.pravatar.cc/300?u=selfie2', score: -1, status: ClientStatus.SUSPENDU, role: Role.CLIENT, filleuls: [], nombrePretsRembourses: 1, dateInscription: daysAgo(80), dateActivation: daysAgo(75), dateDerniereActivite: daysAgo(10), createdAt: daysAgo(80), updatedAt: daysAgo(10) },
  { _id: 'user3', email: 'pierre.durand@email.com', password: 'password123', isEmailVerified: false, nom: 'Durand', prenom: 'Pierre', telephone: '0611223344', pieceIdentite: 'ID789', dateDeNaissance: '1992-01-30', score: 0, status: ClientStatus.EN_ATTENTE, role: Role.CLIENT, filleuls: [], nombrePretsRembourses: 0, dateInscription: daysAgo(2), dateDerniereActivite: daysAgo(2), createdAt: daysAgo(2), updatedAt: daysAgo(2) },
  { _id: 'user4', email: 'sophie.martin@email.com', password: 'password123', isEmailVerified: true, nom: 'Martin', prenom: 'Sophie', telephone: '0655667788', pieceIdentite: 'ID101', dateDeNaissance: '1988-03-12', photoUrl: 'https://i.pravatar.cc/150?u=user4', selfieIdUrl: 'https://i.pravatar.cc/300?u=selfie4', score: 2, status: ClientStatus.ACTIF, role: Role.CLIENT, parrainPar: 'user1', filleuls: [], nombrePretsRembourses: 0, dateInscription: daysAgo(50), dateActivation: daysAgo(48), dateDerniereActivite: daysAgo(1), createdAt: daysAgo(50), updatedAt: daysAgo(1) },
  { _id: 'user5', email: 'luc.petit@email.com', password: 'password123', isEmailVerified: true, nom: 'Petit', prenom: 'Luc', telephone: '0699887766', pieceIdentite: 'ID112', dateDeNaissance: '1976-07-07', score: -3, status: ClientStatus.BLOQUE, role: Role.CLIENT, filleuls: [], nombrePretsRembourses: 0, dateInscription: daysAgo(120), dateActivation: daysAgo(110), dateDerniereActivite: daysAgo(40), createdAt: daysAgo(120), updatedAt: daysAgo(40) },
  { _id: 'admin1', email: 'admin@koba.com', password: 'adminpass', isEmailVerified: true, nom: 'Admin', prenom: 'Super', telephone: '0101010101', pieceIdentite: 'ADMIN01', dateDeNaissance: '1980-01-01', score: 99, status: ClientStatus.ACTIF, role: Role.SUPER_ADMIN, filleuls: [], nombrePretsRembourses: 0, dateInscription: daysAgo(365), dateActivation: daysAgo(365), dateDerniereActivite: daysAgo(0), createdAt: daysAgo(365), updatedAt: daysAgo(0) },
  { _id: 'admin2', email: 'admin2@koba.com', password: 'adminpass', isEmailVerified: true, nom: 'Admin', prenom: 'Simple', telephone: '0202020202', pieceIdentite: 'ADMIN02', dateDeNaissance: '1982-02-02', score: 99, status: ClientStatus.ACTIF, role: Role.ADMIN, filleuls: [], nombrePretsRembourses: 0, dateInscription: daysAgo(200), dateActivation: daysAgo(200), dateDerniereActivite: daysAgo(1), createdAt: daysAgo(200), updatedAt: daysAgo(1) },
  { _id: 'mod1', email: 'modo@koba.com', password: 'modopass', isEmailVerified: true, nom: 'Modo', prenom: 'Anna', telephone: '0303030303', pieceIdentite: 'MOD01', dateDeNaissance: '1995-03-03', score: 99, status: ClientStatus.ACTIF, role: Role.MODERATEUR, filleuls: [], nombrePretsRembourses: 0, dateInscription: daysAgo(150), dateActivation: daysAgo(150), dateDerniereActivite: daysAgo(0), createdAt: daysAgo(150), updatedAt: daysAgo(0) },
];
const initialLoans: LoanApplication[] = [
    { _id: 'loan1', userId: 'user1', status: LoanStatus.DEBLOQUE, requestedAmount: 5000, fees: 500, netAmount: 5500, loanPurpose: 'Achat matériel', createdAt: daysAgo(20), updatedAt: daysAgo(20), disbursedAt: daysAgo(19), approvedAt: daysAgo(20), installments: [ { installmentNumber: 1, dueDate: daysLater(10), dueAmount: 2750, paidAmount: 0, status: InstallmentStatus.EN_ATTENTE, daysLate: 0, warningsSent: false }, { installmentNumber: 2, dueDate: daysLater(40), dueAmount: 2750, paidAmount: 0, status: InstallmentStatus.EN_ATTENTE, daysLate: 0, warningsSent: false } ] },
    { _id: 'loan2', userId: 'user2', status: LoanStatus.DEBLOQUE, requestedAmount: 3000, fees: 300, netAmount: 3300, loanPurpose: 'Factures', createdAt: daysAgo(35), updatedAt: daysAgo(5), disbursedAt: daysAgo(34), approvedAt: daysAgo(35), installments: [ { installmentNumber: 1, dueDate: daysAgo(5), dueAmount: 1650, paidAmount: 0, status: InstallmentStatus.IMPAYEE, daysLate: 5, warningsSent: true }, { installmentNumber: 2, dueDate: daysLater(25), dueAmount: 1650, paidAmount: 0, status: InstallmentStatus.EN_ATTENTE, daysLate: 0, warningsSent: false } ] },
    { _id: 'loan3', userId: 'user1', status: LoanStatus.REMBOURSE, requestedAmount: 2000, fees: 200, netAmount: 2200, loanPurpose: 'Réparation', createdAt: daysAgo(60), updatedAt: daysAgo(30), completedAt: daysAgo(30), disbursedAt: daysAgo(59), approvedAt: daysAgo(60), installments: [ { installmentNumber: 1, dueDate: daysAgo(30), dueAmount: 1100, paidAmount: 1100, status: InstallmentStatus.PAYEE, daysLate: 0, warningsSent: false, paidAt: daysAgo(30) }, { installmentNumber: 2, dueDate: daysAgo(0), dueAmount: 1100, paidAmount: 1100, status: InstallmentStatus.PAYEE, daysLate: 0, warningsSent: false, paidAt: daysAgo(30) } ] },
];
const initialWaitingList: WaitingListItem[] = [ { _id: 'wait1', userId: 'user_waiting', position: 1, hasReferralCode: true, priority: 1, dateInscription: daysAgo(1), createdAt: daysAgo(1) } ];
const initialPotentialDuplicates: PotentialDuplicate[] = [ ];
const initialCapacityConfig: CapacityConfig = { totalCapacity: 700, autoIncrease: true };

export const DataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loans, setLoans] = useState<LoanApplication[]>([]);
    const [waitingList, setWaitingList] = useState<WaitingListItem[]>([]);
    const [potentialDuplicates, setPotentialDuplicates] = useState<PotentialDuplicate[]>([]);
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [capacityConfig, setCapacityConfig] = useState<CapacityConfig>(initialCapacityConfig);

    const performUpdate = useCallback((updateFn: () => void) => {
        setIsUpdating(true);
        setTimeout(() => {
            updateFn();
            setIsUpdating(false);
        }, 700);
    }, []);

    const simulateEmailVerification = useCallback((user: User) => {
        console.group(`SIMULATION: Envoi d'email de vérification à ${user.email}`);
        console.log(`Bonjour ${user.prenom}, veuillez vérifier votre compte.`);
        console.log('Pour simuler le clic sur le lien, copiez et exécutez la commande suivante dans la console :');
        console.log(`%c window.verifyUserEmail('${user._id}')`, 'background: #2D2A26; color: #D97706; font-weight: bold; padding: 4px;');
        console.groupEnd();
    }, []);

    const verifyEmail = useCallback((userId: string) => {
        performUpdate(() => {
            setUsers(currentUsers => currentUsers.map(u => u._id === userId ? { ...u, isEmailVerified: true, status: ClientStatus.ACTIF, dateActivation: new Date().toISOString(), updatedAt: new Date().toISOString() } : u));
            console.log(`✅ SIMULATION: Email pour l'utilisateur ${userId} vérifié avec succès !`);
            alert(`Email pour l'utilisateur ${userId} vérifié ! Vous pouvez maintenant vous connecter.`);
        });
    }, [performUpdate]);

    useEffect(() => {
        window.verifyUserEmail = verifyEmail;
    }, [verifyEmail]);

    useEffect(() => {
        setTimeout(() => {
            setUsers(initialUsers);
            setLoans(initialLoans);
            setWaitingList(initialWaitingList);
            setPotentialDuplicates(initialPotentialDuplicates);
            setLoading(false);
        }, 1500);
    }, []);

    const login = useCallback((email: string, password: string): { user: User | null; error?: string; reason?: string } => {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return { user: null, error: 'not_found' };
        if (user.password !== password) return { user: null, error: 'wrong_password' };

        if (user.status === ClientStatus.REJETE) return { user: null, error: 'account_rejected', reason: user.rejectionReason };
        if (!user.isEmailVerified) return { user: null, error: 'email_not_verified' };
        
        setLoggedInUser(user);
        return { user };
    }, [users]);

    const logout = useCallback(() => setLoggedInUser(null), []);

    const registerUser = useCallback((newUser: any): Promise<{ status: string; user?: User; message?: string }> => {
        return new Promise((resolve) => {
            performUpdate(() => {
                const { referralCode, ...userData } = newUser;
                
                const duplicate = users.find(u => 
                    (u.nom.toLowerCase() === userData.nom.toLowerCase() && u.prenom.toLowerCase() === userData.prenom.toLowerCase() && u.dateDeNaissance === userData.dateDeNaissance) ||
                    u.telephone === userData.telephone ||
                    u.pieceIdentite.toLowerCase() === userData.pieceIdentite.toLowerCase()
                );

                if (duplicate) {
                    setPotentialDuplicates(current => [...current, { newUser: userData, existingUser: duplicate, reason: 'Données similaires détectées.' }]);
                    resolve({ status: 'duplicate' });
                    return;
                }

                let parrain: User | undefined;
                if (referralCode) {
                    parrain = users.find(u => u.codeParrainage === referralCode);
                    if (!parrain) {
                        resolve({ status: 'error', message: "Code de parrainage invalide." });
                        return;
                    }
                    if (parrain.filleuls.length >= 3) {
                        resolve({ status: 'error', message: "Le parrain a atteint sa limite de 3 filleuls." });
                        return;
                    }
                }

                const fullNewUser: User = { ...userData, _id: generateId(), score: 0, status: ClientStatus.EN_ATTENTE, role: Role.CLIENT, isEmailVerified: false, filleuls: [], nombrePretsRembourses: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), parrainPar: parrain?._id };
                
                let updatedUsers = [...users, fullNewUser];
                if (parrain) {
                    updatedUsers = updatedUsers.map(u => u._id === parrain!._id ? { ...u, filleuls: [...u.filleuls, fullNewUser._id] } : u);
                }
                setUsers(updatedUsers);
                
                simulateEmailVerification(fullNewUser);
                resolve({ status: 'success', user: fullNewUser });
            });
        });
    }, [users, performUpdate, simulateEmailVerification]);


    const resendVerificationEmail = useCallback((userId: string) => {
        const user = users.find(u => u._id === userId);
        if (user && !user.isEmailVerified) {
            simulateEmailVerification(user);
        }
    }, [users, simulateEmailVerification]);

    const updateUserStatus = useCallback((userId: string, status: ClientStatus, reason?: string) => {
        performUpdate(() => {
            setUsers(currentUsers => currentUsers.map(u => u._id === userId ? { ...u, status, rejectionReason: reason, updatedAt: new Date().toISOString() } : u));
        });
    }, [performUpdate]);

    const updateLoanStatus = useCallback((loanId: string, status: LoanStatus, reason?: string) => {
        performUpdate(() => {
            setLoans(currentLoans => currentLoans.map(l => {
                if (l._id === loanId) {
                    const updatedLoan = { ...l, status, rejectionReason: reason, updatedAt: new Date().toISOString() };
                    
                    if (status === LoanStatus.APPROUVE) {
                        updatedLoan.approvedAt = new Date().toISOString();
                        // Generate installments if they don't already exist
                        if (updatedLoan.installments.length === 0) {
                            const installmentAmount = updatedLoan.netAmount / 2;
                            updatedLoan.installments = [
                                {
                                    installmentNumber: 1,
                                    dueDate: daysLater(30),
                                    dueAmount: installmentAmount,
                                    paidAmount: 0,
                                    status: InstallmentStatus.EN_ATTENTE,
                                    daysLate: 0,
                                    warningsSent: false,
                                },
                                {
                                    installmentNumber: 2,
                                    dueDate: daysLater(60),
                                    dueAmount: installmentAmount,
                                    paidAmount: 0,
                                    status: InstallmentStatus.EN_ATTENTE,
                                    daysLate: 0,
                                    warningsSent: false,
                                }
                            ];
                        }
                    }

                    if (status === LoanStatus.DEBLOQUE) {
                        updatedLoan.disbursedAt = new Date().toISOString();
                    }
                    
                    return updatedLoan;
                }
                return l;
            }));
        });
    }, [performUpdate]);

    const activateUserFromWaitingList = useCallback((waitingId: string) => {
        performUpdate(() => {
            setWaitingList(currentWaitingList => {
                const item = currentWaitingList.find(w => w._id === waitingId);
                if (item) {
                    setUsers(currentUsers => currentUsers.map(u => u._id === item.userId ? { ...u, status: ClientStatus.ACTIF, dateActivation: new Date().toISOString(), updatedAt: new Date().toISOString() } : u));
                }
                return currentWaitingList.filter(w => w._id !== waitingId);
            });
        });
    }, [performUpdate]);
    
    const resolveDuplicate = useCallback((newUserEmail: string, action: 'approve' | 'reject', reason?: string) => {
        performUpdate(() => {
            const duplicate = potentialDuplicates.find(d => d.newUser.email === newUserEmail);
            if (!duplicate) return;

            if (action === 'approve') {
                const fullNewUser: User = { ...duplicate.newUser, password: 'password123', _id: generateId(), score: 0, status: ClientStatus.EN_ATTENTE, role: Role.CLIENT, isEmailVerified: false, filleuls: [], nombrePretsRembourses: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
                setUsers(current => [...current, fullNewUser]);
                simulateEmailVerification(fullNewUser);
            } else if (action === 'reject') {
                const rejectedUser: User = { ...duplicate.newUser, password: 'password123', _id: generateId(), score: 0, status: ClientStatus.REJETE, role: Role.CLIENT, isEmailVerified: false, filleuls: [], nombrePretsRembourses: 0, rejectionReason: reason, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
                setUsers(current => [...current, rejectedUser]);
            }
            setPotentialDuplicates(current => current.filter(d => d.newUser.email !== newUserEmail));
        });
    }, [potentialDuplicates, performUpdate, simulateEmailVerification]);

    const updateCapacityConfig = useCallback((newConfig: CapacityConfig) => {
        performUpdate(() => {
            setCapacityConfig(newConfig);
        });
    }, [performUpdate]);
    
    const addStaffMember = useCallback(async (details: { prenom: string; nom: string; email: string; role: Role.ADMIN | Role.MODERATEUR; password?: string; }): Promise<{ success: boolean; message: string; }> => {
        return new Promise(resolve => {
            performUpdate(() => {
                const emailExists = users.some(u => u.email.toLowerCase() === details.email.toLowerCase());
                if (emailExists) {
                    resolve({ success: false, message: "Un utilisateur avec cet email existe déjà." });
                    return;
                }
                const newStaff: User = {
                    _id: generateId(),
                    email: details.email,
                    password: details.password || 'password123',
                    isEmailVerified: true,
                    nom: details.nom,
                    prenom: details.prenom,
                    telephone: 'N/A',
                    pieceIdentite: 'N/A',
                    dateDeNaissance: 'N/A',
                    score: 99,
                    status: ClientStatus.ACTIF,
                    role: details.role,
                    filleuls: [],
                    nombrePretsRembourses: 0,
                    dateInscription: new Date().toISOString(),
                    dateActivation: new Date().toISOString(),
                    dateDerniereActivite: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                setUsers(current => [...current, newStaff]);
                resolve({ success: true, message: "Membre du staff ajouté avec succès." });
            });
        });
    }, [users, performUpdate]);

    const updateStaffRole = useCallback((userId: string, newRole: Role) => {
        performUpdate(() => {
            setUsers(current => current.map(u => u._id === userId ? { ...u, role: newRole } : u));
        });
    }, [performUpdate]);

    const deleteStaffMember = useCallback((userId: string) => {
        performUpdate(() => {
            setUsers(current => current.filter(u => u._id !== userId));
        });
    }, [performUpdate]);

    const createLoanApplication = useCallback(async (details: { amount: number; purpose: string; userId: string; }): Promise<{ success: boolean; message: string; }> => {
        return new Promise(resolve => {
            performUpdate(() => {
                const newLoan: LoanApplication = {
                    _id: generateId(),
                    userId: details.userId,
                    status: LoanStatus.EN_ATTENTE,
                    requestedAmount: details.amount,
                    fees: details.amount * 0.1, // 10% fees
                    netAmount: details.amount * 1.1,
                    loanPurpose: details.purpose,
                    installments: [], // Will be populated on approval
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                setLoans(current => [...current, newLoan]);
                resolve({ success: true, message: "Demande de prêt soumise." });
            });
        });
    }, [performUpdate]);

    const submitPaymentProof = useCallback(async (loanId: string, installmentNumber: number, proofFile: File): Promise<{ success: boolean; message: string; }> => {
        return new Promise(resolve => {
            // In a real app, you would upload the file to a server/storage and get a URL.
            // For this mock, we'll simulate it with a placeholder URL.
            const simulatedUrl = `https://proof-placeholder.com/${loanId}/${installmentNumber}/${proofFile.name}`;
            performUpdate(() => {
                setLoans(currentLoans => currentLoans.map(l => {
                    if (l._id === loanId) {
                        const newInstallments = l.installments.map(i => {
                            if (i.installmentNumber === installmentNumber) {
                                return { ...i, status: InstallmentStatus.EN_ATTENTE_CONFIRMATION, paymentProofUrl: simulatedUrl };
                            }
                            return i;
                        });
                        return { ...l, installments: newInstallments };
                    }
                    return l;
                }));
                resolve({ success: true, message: "Preuve de paiement soumise pour vérification." });
            });
        });
    }, [performUpdate]);

    const confirmPayment = useCallback(async (loanId: string, installmentNumber: number): Promise<{ success: boolean; message: string; }> => {
        return new Promise(resolve => {
            performUpdate(() => {
                let targetLoan: LoanApplication | undefined;
                const newLoans = loans.map(l => {
                    if (l._id === loanId) {
                        const newInstallments = l.installments.map(i => {
                            if (i.installmentNumber === installmentNumber) {
                                return { ...i, status: InstallmentStatus.PAYEE, paidAmount: i.dueAmount, paidAt: new Date().toISOString() };
                            }
                            return i;
                        });
                        targetLoan = { ...l, installments: newInstallments };
                        return targetLoan;
                    }
                    return l;
                });

                if (targetLoan) {
                    const allPaid = targetLoan.installments.every(i => i.status === InstallmentStatus.PAYEE);
                    if (allPaid) {
                        targetLoan.status = LoanStatus.REMBOURSE;
                        targetLoan.completedAt = new Date().toISOString();

                        setUsers(currentUsers => currentUsers.map(u => {
                            if (u._id === targetLoan!.userId) {
                                const updatedUser = { ...u, nombrePretsRembourses: u.nombrePretsRembourses + 1 };
                                if (updatedUser.nombrePretsRembourses === 1 && !u.codeParrainage) {
                                    updatedUser.codeParrainage = `${u.prenom.toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
                                }
                                if ((u.status === ClientStatus.SUSPENDU) && (u.score === -1 || u.score === -2)) {
                                     const remainingDebt = newLoans.filter(l => l.userId === u._id && l.status === LoanStatus.DEBLOQUE).length === 0;
                                     if(remainingDebt) {
                                        updatedUser.status = ClientStatus.ACTIF;
                                        updatedUser.score = 0;
                                     }
                                }
                                return updatedUser;
                            }
                            return u;
                        }));
                    }
                }
                setLoans(newLoans);
                resolve({ success: true, message: "Paiement confirmé." });
            });
        });
    }, [loans, performUpdate]);

    const requestUnblocking = useCallback(async (userId: string): Promise<{ success: boolean; message: string; }> => {
        return new Promise(resolve => {
            performUpdate(() => {
                updateUserStatus(userId, ClientStatus.REACTIVATION_EN_ATTENTE);
                resolve({ success: true, message: "Votre demande de déblocage a été envoyée." });
            });
        });
    }, [performUpdate, updateUserStatus]);


    const value: DataContextType = {
        users,
        loans,
        waitingList,
        potentialDuplicates,
        capacityConfig,
        loading,
        isUpdating,
        loggedInUser,
        login,
        logout,
        registerUser,
        resendVerificationEmail,
        updateUserStatus,
        updateLoanStatus,
        activateUserFromWaitingList,
        resolveDuplicate,
        updateCapacityConfig,
        addStaffMember,
        updateStaffRole,
        deleteStaffMember,
        createLoanApplication,
        submitPaymentProof,
        confirmPayment,
        requestUnblocking,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};