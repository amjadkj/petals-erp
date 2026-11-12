import { fetcher } from './fetcher';
import type { ApiResponse, AppointmentDto } from '@petals/types';

export const appointmentsApi = {
  getAppointments: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return fetcher<ApiResponse<AppointmentDto[]>>(`/appointments${qs}`);
  },

  createAppointment: (dto: Partial<AppointmentDto>) =>
    fetcher<ApiResponse<AppointmentDto>>('/appointments', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  reschedule: (id: string, dto: { startTime: string; endTime: string }) =>
    fetcher<ApiResponse<AppointmentDto>>(`/appointments/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  cancel: (id: string, reason: string) =>
    fetcher<ApiResponse<AppointmentDto>>(`/appointments/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  updateStatus: (id: string, status: string) =>
    fetcher<ApiResponse<AppointmentDto>>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getDaily: (date: string, branchId?: string) => {
    const qs = new URLSearchParams({ date, ...(branchId ? { branchId } : {}) }).toString();
    return fetcher<ApiResponse<AppointmentDto[]>>(`/appointments/daily?${qs}`, {}, { skipBranchId: true });
  },
};
