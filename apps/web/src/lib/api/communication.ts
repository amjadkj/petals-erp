import { fetcher } from './fetcher';
import type { ApiResponse } from '@petals/types';

export const communicationApi = {
  getTemplates: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<unknown[]>>(`/communication/templates${qs}`);
  },

  createTemplate: (dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>('/communication/templates', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  approveTemplate: (id: string) =>
    fetcher<ApiResponse<unknown>>(`/communication/templates/${id}/approve`, {
      method: 'PATCH',
    }),

  rejectTemplate: (id: string) =>
    fetcher<ApiResponse<unknown>>(`/communication/templates/${id}/reject`, {
      method: 'PATCH',
    }),

  getMessages: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<unknown[]>>(`/communication/messages${qs}`);
  },

  sendMessage: (dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>('/communication/messages', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  sendBulk: (dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>('/communication/messages/bulk', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getCallLogs: (clientId: string) =>
    fetcher<ApiResponse<unknown[]>>(`/communication/call-logs?clientId=${clientId}`),

  createCallLog: (clientId: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>('/communication/call-logs', {
      method: 'POST',
      body: JSON.stringify({ ...dto, clientId }),
    }),
};
