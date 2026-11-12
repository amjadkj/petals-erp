import { fetcher } from './fetcher';
import type { ApiResponse, InvoiceDto, PaymentDto } from '@petals/types';

export const financeApi = {
  getPayments: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<PaymentDto[]>>(`/finance/payments${qs}`);
  },

  getInvoices: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<InvoiceDto[]>>(`/finance/invoices${qs}`);
  },

  createInvoice: (dto: Partial<InvoiceDto>) =>
    fetcher<ApiResponse<InvoiceDto>>('/finance/invoices', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  recordPayment: (invoiceId: string, dto: Partial<PaymentDto>) =>
    fetcher<ApiResponse<PaymentDto>>(`/finance/invoices/${invoiceId}/payments`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getPaymentsDue: (branchId?: string) => {
    const qs = branchId ? `?branchId=${branchId}` : '';
    return fetcher<ApiResponse<InvoiceDto[]>>(`/finance/payments-due${qs}`, {}, { skipBranchId: !!branchId });
  },

  getMonthlyTracking: (month: string, branchId?: string) => {
    const qs = new URLSearchParams({ month, ...(branchId ? { branchId } : {}) }).toString();
    return fetcher<ApiResponse<unknown>>(`/finance/monthly-tracking?${qs}`, {}, { skipBranchId: !!branchId });
  },

  getExpenses: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<unknown[]>>(`/finance/expenses${qs}`);
  },

  createExpense: (dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>('/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getPnl: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<unknown>>(`/finance/pnl${qs}`);
  },

  getRevenue: (branchId: string, params?: Record<string, string>) => {
    const qs = new URLSearchParams({ branchId, ...params }).toString();
    return fetcher<ApiResponse<unknown>>(`/finance/revenue?${qs}`, {}, { skipBranchId: true });
  },

  getRevenueByCategory: (branchId: string) =>
    fetcher<ApiResponse<unknown>>(`/finance/revenue/by-category?branchId=${branchId}`, {}, { skipBranchId: true }),

  getRevenueByDepartment: (branchId: string) =>
    fetcher<ApiResponse<unknown>>(`/finance/revenue/by-department?branchId=${branchId}`, {}, { skipBranchId: true }),

  exportFinance: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<Blob>(`/finance/export${qs}`);
  },
};
