import { fetcher } from './fetcher';
import type {
  ApiResponse,
  CommunicationChannel,
  MessageStatus,
  TemplateStatus,
} from '@petals/types';

export interface CommunicationTemplateDto {
  id: string;
  name: string;
  language: string;
  body: string;
  status: TemplateStatus;
  approvedById?: string | null;
  approvedBy?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLogDto {
  id: string;
  clientId: string;
  sentById: string;
  templateId?: string | null;
  channel: CommunicationChannel;
  recipient: string;
  message?: string | null;
  status: MessageStatus;
  providerRef?: string | null;
  sentAt: string;
  client?: {
    id: string;
    name: string;
    clientCode: string;
    primaryGuardian?: {
      name: string;
      phone: string;
      relation: string;
    } | null;
  };
  sentBy?: {
    id: string;
    name: string;
  };
  template?: {
    id: string;
    name: string;
  } | null;
}

export interface SendMessagePayload {
  clientId: string;
  channel: CommunicationChannel;
  templateId?: string;
  message?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  variables?: Record<string, string>;
}

export interface SendBulkPayload {
  branchId?: string;
  templateId: string;
  channel: CommunicationChannel;
  filterByFeePending?: boolean;
  departmentId?: string;
  variables?: Record<string, string>;
}

export interface CallLogPayload {
  outcome: string;
  notes?: string;
  durationSeconds?: number;
  contactNumber?: string;
}

export const communicationApi = {
  getTemplates: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<CommunicationTemplateDto[]>>(`/communication/templates${qs}`);
  },

  getTemplate: (id: string) =>
    fetcher<ApiResponse<CommunicationTemplateDto>>(`/communication/templates/${id}`),

  createTemplate: (dto: { name: string; body: string; language?: string }) =>
    fetcher<ApiResponse<CommunicationTemplateDto>>('/communication/templates', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateTemplate: (id: string, dto: { name?: string; body?: string; language?: string }) =>
    fetcher<ApiResponse<CommunicationTemplateDto>>(`/communication/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  approveTemplate: (id: string) =>
    fetcher<ApiResponse<CommunicationTemplateDto>>(`/communication/templates/${id}/approve`, {
      method: 'POST',
    }),

  rejectTemplate: (id: string) =>
    fetcher<ApiResponse<CommunicationTemplateDto>>(`/communication/templates/${id}/reject`, {
      method: 'POST',
    }),

  getMessages: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<CommunicationLogDto[]>>(`/communication/messages${qs}`);
  },

  sendMessage: (dto: SendMessagePayload) =>
    fetcher<ApiResponse<{ id: string; status: MessageStatus; message: string }>>(
      '/communication/send',
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
    ),

  sendBulk: (dto: SendBulkPayload) =>
    fetcher<ApiResponse<{ totalQueued: number; skippedConsent: number }>>(
      '/communication/send-bulk',
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
    ),

  getClientLogs: (clientId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<CommunicationLogDto[]>>(
      `/clients/${clientId}/communication-logs${qs}`,
    );
  },

  createCallLog: (clientId: string, dto: CallLogPayload) =>
    fetcher<ApiResponse<{ id: string; success: boolean }>>(
      `/clients/${clientId}/call-logs`,
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
    ),
};
