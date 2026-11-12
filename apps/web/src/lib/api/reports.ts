import { fetcher } from './fetcher';
import type { ApiResponse, ClinicalReportDto, ReportStatus, ReportType } from '@petals/types';

export interface ReportItemDto extends ClinicalReportDto {
  isOverdue?: boolean;
  client?: {
    id: string;
    name: string;
    clientCode: string;
    branchId?: string;
    branch?: {
      id: string;
      name: string;
      code: string;
    };
  };
  author?: {
    id: string;
    employeeCode: string;
    user?: {
      id: string;
      name: string;
    };
  };
}

export interface ReportsSummaryDto {
  [ReportStatus.DRAFT]: number;
  [ReportStatus.SUBMITTED]: number;
  [ReportStatus.REVIEWED]: number;
  [ReportStatus.SHARED]: number;
  total: number;
}

export interface ReportActivityItem {
  id: string;
  reportId: string;
  action: string;
  previousStatus?: ReportStatus | null;
  newStatus?: ReportStatus | null;
  actorId: string;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
  };
}

export interface CreateReportPayload {
  title: string;
  type: ReportType;
  dueOn?: string | null;
  content?: string | null;
  fileUrl?: string | null;
}

export interface UpdateReportPayload {
  title?: string;
  type?: ReportType;
  dueOn?: string | null;
  content?: string | null;
  fileUrl?: string | null;
  status?: ReportStatus;
}

export const reportsApi = {
  getReportsDue: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<ReportItemDto[]>>(`/reports/due${qs}`);
  },

  getClientReports: (clientId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<ReportItemDto[]>>(`/clients/${clientId}/reports${qs}`);
  },

  getReportsSummary: (clientId: string) =>
    fetcher<ApiResponse<ReportsSummaryDto>>(`/clients/${clientId}/reports/summary`),

  createReport: (clientId: string, dto: CreateReportPayload) =>
    fetcher<ApiResponse<ReportItemDto>>(`/clients/${clientId}/reports`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getReport: (id: string) =>
    fetcher<ApiResponse<ReportItemDto>>(`/reports/${id}`),

  updateReport: (id: string, dto: UpdateReportPayload) =>
    fetcher<ApiResponse<ReportItemDto>>(`/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  shareReport: (id: string) =>
    fetcher<ApiResponse<{ message: string; report: ReportItemDto; notificationsQueued: number }>>(
      `/reports/${id}/share`,
      {
        method: 'POST',
      },
    ),

  checkOverdue: () =>
    fetcher<ApiResponse<{ overdueCount: number; notificationsCreated: number }>>(
      '/reports/check-overdue',
      {
        method: 'POST',
      },
    ),

  getClientReportActivity: (clientId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<ReportActivityItem[]>>(`/clients/${clientId}/reports/activity${qs}`);
  },
};
