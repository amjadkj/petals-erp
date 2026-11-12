import { fetcher } from './fetcher';
import type { ApiResponse, AttendanceRecordDto } from '@petals/types';

export const hrApi = {
  checkIn: (branchId: string) =>
    fetcher<ApiResponse<AttendanceRecordDto>>('/hrms/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ branchId }),
    }),

  checkOut: () =>
    fetcher<ApiResponse<AttendanceRecordDto>>('/hrms/attendance/check-out', {
      method: 'POST',
    }),

  getAttendanceDaily: (date: string, branchId?: string) => {
    const qs = new URLSearchParams({ date, ...(branchId ? { branchId } : {}) }).toString();
    return fetcher<ApiResponse<AttendanceRecordDto[]>>(`/hrms/attendance/daily?${qs}`, {}, { skipBranchId: !!branchId });
  },

  getAttendanceMonthly: (year: number, month: number, branchId?: string) => {
    const qs = new URLSearchParams({ year: String(year), month: String(month), ...(branchId ? { branchId } : {}) }).toString();
    return fetcher<ApiResponse<unknown>>(`/hrms/attendance/monthly?${qs}`, {}, { skipBranchId: !!branchId });
  },

  getLeaves: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<unknown[]>>(`/hrms/leaves${qs}`);
  },

  createLeave: (dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>('/hrms/leaves', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  approveLeave: (id: string, note?: string) =>
    fetcher<ApiResponse<unknown>>(`/hrms/leaves/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    }),

  rejectLeave: (id: string, note?: string) =>
    fetcher<ApiResponse<unknown>>(`/hrms/leaves/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    }),

  setDirectorAvailability: (dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>('/hrms/director-availability', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getHolidays: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<unknown[]>>(`/hrms/holidays${qs}`);
  },

  createHoliday: (dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>('/hrms/holidays', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  deleteHoliday: (id: string) =>
    fetcher<ApiResponse<unknown>>(`/hrms/holidays/${id}`, { method: 'DELETE' }),
};
