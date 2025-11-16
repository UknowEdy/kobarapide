export enum Role {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
  MODERATEUR = 'MODERATEUR',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export type ClientStatus = 'EN_ATTENTE' | 'ACTIF' | 'SUSPENDU' | 'BLOQUE' | 'REACTIVATION_EN_ATTENTE' | 'INACTIF_EXCLU' | 'EN_VERIFICATION_DOUBLON' | 'REJETE';
export type LoanStatus = 'EN_ATTENTE' | 'APPROUVE' | 'DEBLOQUE' | 'REMBOURSE' | 'REJETE' | 'DEFAUT';

export interface User {
  _id: string;
  email: string;
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
