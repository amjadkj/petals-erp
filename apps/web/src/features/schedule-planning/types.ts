export type SchedulePlanningTabId = 'schedules' | 'availability' | 'attention';

export interface RecurringScheduleRow {
  id: string;
  clientName: string;
  clientCode?: string;
  clientId: string;
  departmentName: string;
  therapistName: string;
  recurrenceRule: string; // e.g. "FREQ=WEEKLY;BYDAY=MO,WE,FR"
  ruleInWords: string; // e.g. "Mon, Wed, Fri · 4:00 pm"
  startTime: string;
  durationMinutes: number;
  startsOn: string;
  endsOn?: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  sessionsGenerated: number;
}

export interface FlaggedSessionItem {
  id: string;
  appointmentId: string;
  clientName: string;
  therapistName: string;
  departmentName: string;
  startsAt: string;
  endsAt: string;
  reason: 'STAFF_LEAVE' | 'PUBLIC_HOLIDAY' | 'THERAPIST_CONFLICT';
  reasonLabel: string;
  therapistLeaveNote?: string;
}

export interface TherapistAvailabilityRow {
  therapistId: string;
  therapistName: string;
  department: string;
  slots: {
    hour: number;
    status: 'booked' | 'free' | 'leave' | 'other_branch';
    details?: string;
  }[];
}
