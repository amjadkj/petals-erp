import { fetcher } from './fetcher';
import type { ApiResponse, AppointmentDto, AppointmentStatus } from '@petals/types';

export interface ExtendedAppointment extends Partial<AppointmentDto> {
  id: string;
  branchId: string;
  clientId: string;
  clientName?: string;
  clientCode?: string;
  client?: { name: string; clientCode?: string };
  therapistId: string;
  therapistName?: string;
  therapist?: { user?: { name: string; email?: string }; designation?: string };
  departmentId?: string;
  departmentName?: string;
  department?: { id: string; name: string; code: string };
  roomId?: string | null;
  roomName?: string | null;
  startsAt?: string;
  endsAt?: string;
  startTime?: string;
  endTime?: string;
  status: AppointmentStatus;
  notes?: string | null;
  cancellationReason?: string | null;
  cancelReason?: string | null;
  isConflict?: boolean;
}

export const appointmentsApi = {
  getAppointments: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return fetcher<ApiResponse<ExtendedAppointment[]>>(`/appointments${qs}`);
  },

  createAppointment: (dto: {
    branchId: string;
    clientId: string;
    therapistId: string;
    startsAt: string;
    endsAt: string;
    roomId?: string | null;
    scheduleId?: string;
  }) =>
    fetcher<ApiResponse<ExtendedAppointment>>('/appointments', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  reschedule: (id: string, dto: { startsAt: string; endsAt: string }) =>
    fetcher<ApiResponse<ExtendedAppointment>>(`/appointments/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  cancel: (id: string, reason: string) =>
    fetcher<ApiResponse<ExtendedAppointment>>(`/appointments/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  updateStatus: (id: string, status: string, cancelReason?: string) =>
    fetcher<ApiResponse<ExtendedAppointment>>(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, cancelReason }),
    }),

  getDaily: (date: string, branchId?: string) => {
    const qs = new URLSearchParams({ date, ...(branchId ? { branchId } : {}) }).toString();
    return fetcher<ApiResponse<ExtendedAppointment[]>>(`/appointments/daily?${qs}`, {}, { skipBranchId: true });
  },
};
