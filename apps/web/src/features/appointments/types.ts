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

export interface ScheduleSlot {
  id: string;
  label: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  startMinutes: number;
  endMinutes: number;
}

/**
 * Standard Petals clinic operating hours:
 * 08:30 AM to 05:15 PM in 45-min sessions.
 * 01:15 PM to 02:00 PM is the official lunch break and is hidden from the grid.
 */
export const CLINIC_SCHEDULE_SLOTS: ScheduleSlot[] = [
  { id: 'slot-1', label: '08:30 - 09:15 AM', startTime: '08:30', endTime: '09:15', startMinutes: 8 * 60 + 30, endMinutes: 9 * 60 + 15 },
  { id: 'slot-2', label: '09:15 - 10:00 AM', startTime: '09:15', endTime: '10:00', startMinutes: 9 * 60 + 15, endMinutes: 10 * 60 },
  { id: 'slot-3', label: '10:00 - 10:45 AM', startTime: '10:00', endTime: '10:45', startMinutes: 10 * 60, endMinutes: 10 * 60 + 45 },
  { id: 'slot-4', label: '10:45 - 11:30 AM', startTime: '10:45', endTime: '11:30', startMinutes: 10 * 60 + 45, endMinutes: 11 * 60 + 30 },
  { id: 'slot-5', label: '11:30 - 12:15 PM', startTime: '11:30', endTime: '12:15', startMinutes: 11 * 60 + 30, endMinutes: 12 * 60 + 15 },
  { id: 'slot-6', label: '12:30 - 01:15 PM', startTime: '12:30', endTime: '13:15', startMinutes: 12 * 60 + 30, endMinutes: 13 * 60 + 15 },
  // 01:15 PM - 02:00 PM (13:15 to 14:00) Lunch Break is hidden
  { id: 'slot-7', label: '02:00 - 02:45 PM', startTime: '14:00', endTime: '14:45', startMinutes: 14 * 60, endMinutes: 14 * 60 + 45 },
  { id: 'slot-8', label: '02:45 - 03:30 PM', startTime: '14:45', endTime: '15:30', startMinutes: 14 * 60 + 45, endMinutes: 15 * 60 + 30 },
  { id: 'slot-9', label: '03:30 - 04:15 PM', startTime: '15:30', endTime: '16:15', startMinutes: 15 * 60 + 30, endMinutes: 16 * 60 + 15 },
  { id: 'slot-10', label: '04:30 - 05:15 PM', startTime: '16:30', endTime: '17:15', startMinutes: 16 * 60 + 30, endMinutes: 17 * 60 + 15 },
];
