import { fetcher } from './fetcher';
import type { ApiResponse } from '@petals/types';

export const schedulesApi = {
  createSchedule: (dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>('/schedules', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getSchedules: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<unknown[]>>(`/schedules${qs}`);
  },

  updateSchedule: (id: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>(`/schedules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),
};
