import { InvoiceStatus, PaymentMethod } from '@petals/types';

export interface PaymentRow {
  id: string;
  clientName: string;
  clientId?: string;
  invoiceId?: string;
  date: string;
  amount: number;
  method?: PaymentMethod | string;
  status: InvoiceStatus | string;
  receiptNumber?: string;
  dueDate?: string;
}

export interface OverdueAccount {
  id: string;
  clientName: string;
  clientId: string;
  invoiceId: string;
  amount: number;
  dueDate: string;
  phone?: string;
}

export interface ExpenseItem {
  id: string;
  branchId?: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  receiptUrl?: string;
}

export interface PnlSummary {
  month: string;
  revenue: number;
  expenses: number;
  netMargin: number;
  marginPercent: number;
  branchBreakdown?: {
    branchName: string;
    revenue: number;
    expenses: number;
    margin: number;
  }[];
}

export interface MonthlyTrackingRow {
  month: string;
  billed: number;
  collected: number;
  pending: number;
  collectionRate: number;
}
