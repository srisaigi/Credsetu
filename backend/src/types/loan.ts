export type LoanStatus = 'active' | 'repaid';

export interface LoanEntry {
  id: number;
  friendName: string;
  phoneNumber: string;
  amount: number;
  dueDate: string;
  createdAt: string;
  repaidAt: string | null;
  status: LoanStatus;
  receiptUrl?: string | null;
}

export interface SummaryResponse {
  totalLent: number;
  totalRepaid: number;
  overdueAmount: number;
}
