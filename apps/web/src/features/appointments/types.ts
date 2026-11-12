import { ExtendedAppointment } from '@/lib/api/appointments';
import { AppointmentStatus } from '@petals/types';

export type CalendarViewMode = 'day' | 'week' | 'month';

export interface AppointmentFiltersState {
  therapistId: string;
  departmentId: string;
  status: string; // 'ALL' | AppointmentStatus
}

export const INITIAL_APPOINTMENT_FILTERS: AppointmentFiltersState = {
  therapistId: 'ALL',
  departmentId: 'ALL',
  status: 'ALL',
};

export interface PositionedAppointment {
  appointment: ExtendedAppointment;
  dayIndex: number; // 0 (Mon) to 6 (Sun)
  topPx: number; // from 9:00 AM
  heightPx: number;
  colOffsetIndex: number;
  totalColsInGroup: number;
  startsAtDate: Date;
  endsAtDate: Date;
}
