import type { UserSummary } from '@petals/types';

export interface EmployeeItem extends UserSummary {
  employeeCode: string;
  designation: string;
  department: string;
  branchName: string;
  joiningDate?: string | null;
  salary?: number | null; // Masked / visible only with EMPLOYEE_SALARY:view
  avatarUrl?: string | null;
  phone?: string | null;
  qualifications?: string | null;
  emergencyContact?: string | null;
}

export interface PerformanceStats {
  sessionsCompleted: number;
  sessionsScheduled: number;
  completionRate: number;
  reportTimelinessPercent: number;
  reportsOnTime: number;
  reportsTotal: number;
  attendancePercent: number;
  workingDaysPresent: number;
  workingDaysTotal: number;
  assignedClientsTotal: number;
  primaryClients: number;
  sharedClients: number;
}

export interface WeeklyTrendPoint {
  week: string;
  completion: number; // 0 - 100
}

export interface AssignedCaseItem {
  id: string;
  clientName: string;
  clientCode: string;
  status: string; // 'Improving', 'Active', 'Maintaining'
  longTermGoal: string;
  subGoalText: string;
  response: string;
  remarks: string;
  progressPercent: number;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
  clientName?: string;
  detail: string;
}

export interface EmployeeReportItem {
  id: string;
  title: string;
  clientName: string;
  dueOn: string;
  submittedOn?: string;
  isOnTime: boolean;
  status: string;
}
