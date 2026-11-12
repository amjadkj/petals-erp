import { fetcher } from './fetcher';
import type { ApiResponse } from '@petals/types';

export interface ScheduleItem {
  id: string;
  planId: string;
  recurrenceRule: string;
  startTime: string;
  durationMinutes: number;
  startsOn: string;
  endsOn?: string | null;
  isActive: boolean;
  plan?: {
    id: string;
    clientId: string;
    client?: { id: string; name: string; clientCode?: string };
    department?: { id: string; name: string; code: string };
    therapist?: { id: string; designation?: string; user?: { name: string } };
  };
}

export const schedulesApi = {
  createSchedule: (dto: {
    planId: string;
    recurrenceRule: string;
    startTime: string;
    durationMinutes?: number;
    startsOn: string;
    endsOn?: string;
  }) =>
    fetcher<ApiResponse<ScheduleItem>>('/schedules', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getSchedules: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<ScheduleItem[]>>(`/schedules${qs}`);
  },

  updateSchedule: (id: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<ScheduleItem>>(`/schedules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),
};
