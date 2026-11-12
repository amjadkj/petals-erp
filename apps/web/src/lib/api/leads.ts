import { fetcher } from './fetcher';
import type { ApiResponse, LeadDto } from '@petals/types';

export const leadsApi = {
  getLeads: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<LeadDto[]>>(`/leads${qs}`);
  },

  getLeadsBoard: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<Record<string, LeadDto[]>>>(`/leads/board${qs}`);
  },

  createLead: (dto: Partial<LeadDto>) =>
    fetcher<ApiResponse<LeadDto>>('/leads', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateLead: (id: string, dto: Partial<LeadDto>) =>
    fetcher<ApiResponse<LeadDto>>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  getConvertPreview: (id: string) =>
    fetcher<ApiResponse<unknown>>(`/leads/${id}/convert-preview`),

  convertLead: (id: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>(`/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  checkFollowUps: () =>
    fetcher<ApiResponse<LeadDto[]>>('/leads/follow-ups'),
};
