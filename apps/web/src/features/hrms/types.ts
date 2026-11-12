import { LeaveType, LeaveStatus } from '@petals/types';

export interface StaffAttendanceItem {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  checkIn?: string | null;
  checkOut?: string | null;
  hours?: string | null;
  status: 'present' | 'late' | 'on_leave';
  isLate?: boolean;
}

export interface LeaveRequestItem {
  id: string;
  employeeId: string;
  employeeName: string;
  role?: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionNote?: string;
}

export interface HolidayItem {
  id: string;
  date: string;
  name: string;
  branchName?: string; // "All branches" or specific branch
  branchId?: string;
  notes?: string;
}

export interface SessionAttendanceItem {
  therapistId: string;
  therapistName: string;
  department: string;
  scheduled: number;
  attended: number;
  noShow: number;
  cancelled: number;
  completionRate: number;
}
