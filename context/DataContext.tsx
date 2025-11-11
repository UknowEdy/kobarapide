import { fetchPOST, fetchGET } from '../utils/api';
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

export const DataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loans, setLoans] = useState<LoanApplication[]>([]);
    const [waitingList, setWaitingList] = useState<WaitingListItem[]>([]);
    const [potentialDuplicates, setPotentialDuplicates] = useState<PotentialDuplicate[]>([]);
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [capacityConfig, setCapacityConfig] = useState<CapacityConfig>({ totalCapacity: 700, autoIncrease: true });

    const performUpdate = useCallback((updateFn: () => void) => {
        setIsUpdating(true);
        setTimeout(() => {
            updateFn();
            setIsUpdating(false);
        }, 700);
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                
                const token = localStorage.getItem('token');
                if (token) {
                    const meResult = await fetchGET('/api/auth/me');
                    if (meResult.success) {
                        setLoggedInUser(meResult.data.user);
                    }
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Error loading initial data:', error);
                setLoading(false);
            }
        };
        
        loadInitialData();
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<{ user: User | null; error?: string; reason?: string }> => {
        try {
            const result = await fetchPOST('/api/auth/login', { email, password });
            
            if (!result.success) {
                console.error('❌ Login failed:', result.error);
                return { user: null, error: 'invalid_credentials' };
            }

            const { token, user } = result.data;
            localStorage.setItem('token', token);
            setLoggedInUser(user);
            
            console.log('✅ Login successful:', user.email);
            return { user };
        } catch (err) {
            console.error('❌ Login error:', err);
            return { user: null, error: 'server_error' };
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setLoggedInUser(null);
        setUsers([]);
        setLoans([]);
        setWaitingList([]);
        setPotentialDuplicates([]);
    }, []);

    const registerUser = useCallback(async (newUser: any): Promise<{ status: string; user?: User; message?: string }> => {
        try {
            const result = await fetchPOST('/api/auth/register', newUser);
            
            if (!result.success) {
                return { status: 'error', message: result.error || 'Registration failed' };
            }
            
            return { status: 'success', user: result.data.user };
        } catch (error) {
            console.error('Registration error:', error);
            return { status: 'error', message: 'Server error during registration' };
        }
    }, []);

    const resendVerificationEmail = useCallback((userId: string) => {
        console.log('Resend verification email for user:', userId);
    }, []);

    const updateUserStatus = useCallback((userId: string, status: ClientStatus, reason?: string) => {
        performUpdate(() => {
            setUsers(currentUsers => currentUsers.map(u => 
                u._id === userId ? { ...u, status, rejectionReason: reason, updatedAt: new Date().toISOString() } : u
            ));
        });
    }, [performUpdate]);

    const updateLoanStatus = useCallback((loanId: string, status: LoanStatus, reason?: string) => {
        performUpdate(() => {
            setLoans(currentLoans => currentLoans.map(l => 
                l._id === loanId ? { ...l, status, rejectionReason: reason, updatedAt: new Date().toISOString() } : l
            ));
        });
    }, [performUpdate]);

    const activateUserFromWaitingList = useCallback((waitingId: string) => {
        performUpdate(() => {
            setWaitingList(currentWaitingList => {
                const item = currentWaitingList.find(w => w._id === waitingId);
                if (item) {
                    setUsers(currentUsers => currentUsers.map(u => 
                        u._id === item.userId ? { ...u, status: ClientStatus.ACTIF, dateActivation: new Date().toISOString(), updatedAt: new Date().toISOString() } : u
                    ));
                }
                return currentWaitingList.filter(w => w._id !== waitingId);
            });
        });
    }, [performUpdate]);

    const resolveDuplicate = useCallback((newUserEmail: string, action: 'approve' | 'reject', reason?: string) => {
        performUpdate(() => {
            setPotentialDuplicates(current => current.filter(d => d.newUser?.email !== newUserEmail));
        });
    }, [performUpdate]);

    const updateCapacityConfig = useCallback((newConfig: CapacityConfig) => {
        performUpdate(() => {
            setCapacityConfig(newConfig);
        });
    }, [performUpdate]);

    const addStaffMember = useCallback(async (details: { prenom: string; nom: string; email: string; role: Role.ADMIN | Role.MODERATEUR; password?: string; }): Promise<{ success: boolean; message: string; }> => {
        try {
            const result = await fetchPOST('/api/staff', details);
            
            if (!result.success) {
                return { success: false, message: result.error || 'Failed to add staff member' };
            }
            
            return { success: true, message: 'Staff member added successfully' };
        } catch (error) {
            console.error('Add staff error:', error);
            return { success: false, message: 'Server error' };
        }
    }, []);

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
        try {
            const result = await fetchPOST('/api/loans', {
                userId: details.userId,
                montant: details.amount,
                raison: details.purpose
            });
            
            if (!result.success) {
                return { success: false, message: result.error || 'Failed to create loan application' };
            }
            
            return { success: true, message: 'Loan application submitted' };
        } catch (error) {
            console.error('Create loan error:', error);
            return { success: false, message: 'Server error' };
        }
    }, []);

    const submitPaymentProof = useCallback(async (loanId: string, installmentNumber: number, proofFile: File): Promise<{ success: boolean; message: string; }> => {
        return { success: true, message: 'Payment proof submitted' };
    }, []);

    const confirmPayment = useCallback(async (loanId: string, installmentNumber: number): Promise<{ success: boolean; message: string; }> => {
        return { success: true, message: 'Payment confirmed' };
    }, []);

    const requestUnblocking = useCallback(async (userId: string): Promise<{ success: boolean; message: string; }> => {
        return { success: true, message: 'Unblocking request sent' };
    }, []);

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
