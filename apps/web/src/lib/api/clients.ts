import { fetcher } from './fetcher';
import type { ApiResponse, ClientDto } from '@petals/types';

export const clientsApi = {
  getClients: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return fetcher<ApiResponse<ClientDto[]>>(`/clients${qs}`);
  },

  getClient: (id: string) =>
    fetcher<ApiResponse<ClientDto>>(`/clients/${id}`),

  createClient: (dto: Partial<ClientDto>) =>
    fetcher<ApiResponse<ClientDto>>('/clients', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateClient: (id: string, dto: Partial<ClientDto>) =>
    fetcher<ApiResponse<ClientDto>>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  getClientProfile: (id: string) =>
    fetcher<ApiResponse<ClientDto & { allowedTabs: string[] }>>(`/clients/${id}/profile`),

  getClientOverview: (id: string) =>
    fetcher<ApiResponse<Record<string, unknown>>>(`/clients/${id}/overview`),

  getAssessments: (id: string) =>
    fetcher<ApiResponse<unknown[]>>(`/clients/${id}/assessments`),

  getGuardians: (id: string) =>
    fetcher<ApiResponse<unknown[]>>(`/clients/${id}/guardians`),

  getClientSessions: (id: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<unknown[]>>(`/clients/${id}/sessions${qs}`);
  },

  getClientDocuments: (id: string) =>
    fetcher<ApiResponse<unknown[]>>(`/clients/${id}/documents`),

  getClientPaymentPlan: (id: string) =>
    fetcher<ApiResponse<unknown>>(`/clients/${id}/payment-plan`),

  getClientProgress: (id: string) =>
    fetcher<ApiResponse<unknown[]>>(`/clients/${id}/progress`),
};
