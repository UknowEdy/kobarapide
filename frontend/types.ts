export enum Role {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
  MODERATEUR = 'MODERATEUR',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
