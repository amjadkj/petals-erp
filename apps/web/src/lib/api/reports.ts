import { fetcher } from './fetcher';
import type { ApiResponse, ClinicalReportDto } from '@petals/types';

export const reportsApi = {
  getReportsDue: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<ClinicalReportDto[]>>(`/reports/due${qs}`);
  },

  getClientReports: (clientId: string) =>
    fetcher<ApiResponse<ClinicalReportDto[]>>(`/reports?clientId=${clientId}`),

  createReport: (clientId: string, dto: Partial<ClinicalReportDto>) =>
    fetcher<ApiResponse<ClinicalReportDto>>('/reports', {
      method: 'POST',
      body: JSON.stringify({ ...dto, clientId }),
    }),

  getReport: (id: string) =>
    fetcher<ApiResponse<ClinicalReportDto>>(`/reports/${id}`),

  updateReport: (id: string, dto: Partial<ClinicalReportDto>) =>
    fetcher<ApiResponse<ClinicalReportDto>>(`/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  shareReport: (id: string) =>
    fetcher<ApiResponse<ClinicalReportDto>>(`/reports/${id}/share`, {
      method: 'POST',
    }),

  checkOverdue: () =>
    fetcher<ApiResponse<ClinicalReportDto[]>>('/reports/check-overdue', {
      method: 'POST',
    }),
};
