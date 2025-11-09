import { ClientStatus, LoanStatus, InstallmentStatus } from './types';

export const CLIENT_STATUS_CONFIG: Record<ClientStatus, { text: string; color: string }> = {
  [ClientStatus.EN_ATTENTE]: { text: 'En Attente', color: 'bg-yellow-500 text-black' },
  [ClientStatus.ACTIF]: { text: 'Actif', color: 'bg-green-500 text-white' },
  [ClientStatus.SUSPENDU]: { text: 'Suspendu', color: 'bg-orange-500 text-white' },
  [ClientStatus.BLOQUE]: { text: 'Bloqué', color: 'bg-red-600 text-white' },
  [ClientStatus.REACTIVATION_EN_ATTENTE]: { text: 'Réactivation', color: 'bg-blue-500 text-white' },
  [ClientStatus.INACTIF_EXCLU]: { text: 'Inactif/Exclu', color: 'bg-gray-500 text-white' },
  // FIX: Added missing ClientStatus enum members to satisfy the Record type.
  [ClientStatus.EN_VERIFICATION_DOUBLON]: { text: 'Vérification Doublon', color: 'bg-purple-500 text-white' },
  [ClientStatus.REJETE]: { text: 'Rejeté', color: 'bg-zinc-700 text-white' },
};

export const LOAN_STATUS_CONFIG: Record<LoanStatus, { text: string; color: string }> = {
  [LoanStatus.EN_ATTENTE]: { text: 'En Attente', color: 'bg-yellow-500 text-black' },
  [LoanStatus.APPROUVE]: { text: 'Approuvé', color: 'bg-blue-500 text-white' },
  [LoanStatus.DEBLOQUE]: { text: 'Débloqué', color: 'bg-green-500 text-white' },
  [LoanStatus.REMBOURSE]: { text: 'Remboursé', color: 'bg-purple-500 text-white' },
  [LoanStatus.REJETE]: { text: 'Rejeté', color: 'bg-red-600 text-white' },
  [LoanStatus.DEFAUT]: { text: 'Défaut', color: 'bg-pink-600 text-white' },
};

export const INSTALLMENT_STATUS_CONFIG: Record<InstallmentStatus, { text: string; color: string }> = {
    [InstallmentStatus.EN_ATTENTE]: { text: 'En Attente', color: 'bg-gray-500 text-white' },
    [InstallmentStatus.PAYEE]: { text: 'Payée', color: 'bg-green-500 text-white' },
    [InstallmentStatus.EN_RETARD]: { text: 'En Retard', color: 'bg-yellow-500 text-black' },
    [InstallmentStatus.IMPAYEE]: { text: 'Impayée', color: 'bg-red-600 text-white' },
    [InstallmentStatus.EN_ATTENTE_CONFIRMATION]: { text: 'En attente de confirmation', color: 'bg-cyan-500 text-white' },
};

export const SCORE_LOAN_LIMITS: { [key: string]: number } = {
  '0-3': 5000,
  '4-6': 10000,
  '7-9': 15000,
  '10+': 20000,
};

export const getLoanLimitForScore = (score: number): number => {
    if (score >= 10) return SCORE_LOAN_LIMITS['10+'];
    if (score >= 7) return SCORE_LOAN_LIMITS['7-9'];
    if (score >= 4) return SCORE_LOAN_LIMITS['4-6'];
    if (score >= 0) return SCORE_LOAN_LIMITS['0-3'];
    return 0;
};