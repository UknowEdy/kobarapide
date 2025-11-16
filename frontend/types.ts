export enum Role {
  CLIENT = 'CLIENT',
  MODERATEUR = 'MODERATEUR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum ClientStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
  BLOQUE = 'BLOQUE',
  REACTIVATION_EN_ATTENTE = 'REACTIVATION_EN_ATTENTE',
  INACTIF_EXCLU = 'INACTIF_EXCLU',
  EN_VERIFICATION_DOUBLON = 'EN_VERIFICATION_DOUBLON',
  REJETE = 'REJETE',
}

export enum LoanStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVE = 'APPROUVE',
  DEBLOQUE = 'DEBLOQUE',
  REMBOURSE = 'REMBOURSE',
  REJETE = 'REJETE',
  DEFAUT = 'DEFAUT',
}

export enum InstallmentStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  PAYEE = 'PAYEE',
  EN_RETARD = 'EN_RETARD',
  IMPAYEE = 'IMPAYEE',
  EN_ATTENTE_CONFIRMATION = 'EN_ATTENTE_CONFIRMATION',
}

export interface User {
  _id: string;
  email: string;
  password?: string;
  isEmailVerified: boolean;
  nom: string;
  prenom: string;
  telephone: string;
  pieceIdentite: string;
  dateDeNaissance: string;
  photoUrl?: string;
  selfieIdUrl?: string;
  score: number;
  status: ClientStatus;
  role: Role;
  codeParrainage?: string;
  parrainPar?: string;
  filleuls: string[];
  dateInscription: string;
  dateActivation?: string;
  dateDerniereActivite: string;
  nombrePretsRembourses: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Installment {
  installmentNumber: number;
  dueDate: string;
  dueAmount: number;
  paidAmount: number;
  paidAt?: string;
  status: InstallmentStatus;
  daysLate: number;
  warningsSent: boolean;
  paymentProofUrl?: string;
}

export interface LoanApplication {
  _id: string;
  userId: string;
  status: LoanStatus;
  requestedAmount: number;
  fees: number;
  netAmount: number;
  loanPurpose: string;
  validatedBy?: string;
  validationJustification?: string;
  rejectionReason?: string;
  approvedAt?: string;
  disbursedAt?: string;
  completedAt?: string;
  installments: Installment[];
  createdAt: string;
  updatedAt: string;
}

export interface WaitingListItem {
  _id: string;
  userId: string;
  position: number;
  hasReferralCode: boolean;
  priority: 1 | 2;
  dateInscription: string;
  createdAt: string;
}

export interface PotentialDuplicate {
  newUser: Omit<User, '_id' | 'score' | 'status' | 'role' | 'filleuls' | 'nombrePretsRembourses' | 'createdAt' | 'updatedAt' | 'isEmailVerified'>;
  existingUser: User;
  reason: string;
}

export interface CapacityConfig {
  totalCapacity: number;
  autoIncrease: boolean;
}

export interface DataContextType {
  users: User[];
  loans: LoanApplication[];
  waitingList: WaitingListItem[];
  potentialDuplicates: PotentialDuplicate[];
  capacityConfig: CapacityConfig;
  loading: boolean;
  isUpdating: boolean;
  loggedInUser: User | null;
  login: (email: string, password: string) => { user: User | null; error?: string; reason?: string };
  logout: () => void;
  registerUser: (newUser: any) => Promise<{ status: string; user?: User; message?: string }>;
  resendVerificationEmail: (userId: string) => void;
  updateUserStatus: (userId: string, status: ClientStatus, reason?: string) => void;
  updateLoanStatus: (loanId: string, status: LoanStatus, reason?: string) => void;
  activateUserFromWaitingList: (waitingId: string) => void;
  resolveDuplicate: (newUserEmail: string, action: 'approve' | 'reject', reason?: string) => void;
  updateCapacityConfig: (newConfig: CapacityConfig) => void;
  addStaffMember: (details: { prenom: string; nom: string; email: string; role: Role.ADMIN | Role.MODERATEUR; password?: string; }) => Promise<{ success: boolean; message: string }>;
  updateStaffRole: (userId: string, newRole: Role) => void;
  deleteStaffMember: (userId: string) => void;
  createLoanApplication: (details: { amount: number; purpose: string; userId: string; }) => Promise<{ success: boolean; message: string }>;
  submitPaymentProof: (loanId: string, installmentNumber: number, proofFile: File) => Promise<{ success: boolean; message: string; }>;
  confirmPayment: (loanId: string, installmentNumber: number) => Promise<{ success: boolean; message: string; }>;
  requestUnblocking: (userId: string) => Promise<{ success: boolean; message: string; }>;
}
