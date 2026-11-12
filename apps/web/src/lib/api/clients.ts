import { fetcher } from './fetcher';
import type { ApiResponse, ClientDto } from '@petals/types';

export interface ClientProfileHeader extends ClientDto {
  allowedTabs: string[];
  age?: number;
  departments?: Array<{ id: string; name: string; code: string }>;
  therapists?: Array<{ id: string; name: string; designation?: string }>;
}

export interface ClientOverviewData {
  client: ClientDto;
  primaryGuardian?: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    relation: string;
    whatsappConsent?: boolean;
    emailConsent?: boolean;
    isPrimary?: boolean;
  } | null;
  guardians?: Array<{
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    relation: string;
    isPrimary?: boolean;
    whatsappConsent?: boolean;
    emailConsent?: boolean;
  }>;
  caseHistory?: string | null;
  assignedTherapists?: Array<{
    id: string;
    name: string;
    designation?: string;
    department?: string;
  }>;
  activePlans?: Array<{
    id: string;
    department: { name: string; code: string };
    therapist: { user: { name: string } };
    sessionsPerWeek: number;
    feePerSession: number;
  }>;
}

export interface AssessmentItem {
  id: string;
  clientId: string;
  assessedAt: string;
  tool: string;
  assessorId: string;
  assessorName?: string;
  scores?: Record<string, number>;
  observations?: string | null;
  summary?: string | null;
}

export interface TreatmentPlanItem {
  id: string;
  clientId: string;
  departmentId: string;
  department?: { id: string; name: string; code: string };
  therapistId: string;
  therapist?: { id: string; designation?: string; user: { id: string; name: string; email: string } };
  sessionsPerWeek: number;
  sessionDurationMinutes: number;
  feePerSession: number;
  startDate: string;
  endDate?: string | null;
  status: string;
}

export interface GoalItem {
  id: string;
  planId: string;
  domain: string;
  term: string;
  description: string;
  status: string;
  authorId?: string;
  authorName?: string;
  subgoals?: SubgoalItem[];
}

export interface SubgoalItem {
  id: string;
  goalId: string;
  description: string;
  frequency: string;
  status: string;
  progressEntries?: ProgressEntryItem[];
}

export interface ProgressEntryItem {
  id: string;
  subgoalId: string;
  entryDate: string;
  score?: number | null;
  level: string;
  description?: string;
  clientResponse?: string | null;
  remarks?: string | null;
  authorId?: string;
  authorName?: string;
}

export const clientsApi = {
  getClients: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return fetcher<ApiResponse<ClientDto[]>>(`/clients${qs}`);
  },

  getClient: (id: string) =>
    fetcher<ApiResponse<ClientDto>>(`/clients/${id}`),

  createClient: (dto: Partial<ClientDto> & { guardians?: Array<Record<string, unknown>> }) =>
    fetcher<ApiResponse<ClientDto>>('/clients', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateClient: (id: string, dto: Partial<ClientDto>) =>
    fetcher<ApiResponse<ClientDto>>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  getClientProfile: (id: string) =>
    fetcher<ApiResponse<ClientProfileHeader>>(`/clients/${id}`),

  getClientOverview: (id: string) =>
    fetcher<ApiResponse<ClientOverviewData>>(`/clients/${id}/overview`),

  getGuardians: (id: string) =>
    fetcher<ApiResponse<unknown[]>>(`/clients/${id}/guardians`),

  addGuardian: (id: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>(`/clients/${id}/guardians`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getAssessments: (id: string) =>
    fetcher<ApiResponse<AssessmentItem[]>>(`/clients/${id}/assessments`),

  createAssessment: (id: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<AssessmentItem>>(`/clients/${id}/assessments`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateAssessment: (assessmentId: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<AssessmentItem>>(`/assessments/${assessmentId}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  deleteAssessment: (assessmentId: string) =>
    fetcher<ApiResponse<unknown>>(`/assessments/${assessmentId}`, {
      method: 'DELETE',
    }),

  getTreatmentPlans: (id: string) =>
    fetcher<ApiResponse<TreatmentPlanItem[]>>(`/clients/${id}/treatment-plans`),

  createTreatmentPlan: (id: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<TreatmentPlanItem>>(`/clients/${id}/treatment-plans`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateTreatmentPlan: (planId: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<TreatmentPlanItem>>(`/treatment-plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  deleteTreatmentPlan: (planId: string) =>
    fetcher<ApiResponse<unknown>>(`/treatment-plans/${planId}`, {
      method: 'DELETE',
    }),

  getGoals: (id: string) =>
    fetcher<ApiResponse<GoalItem[]>>(`/clients/${id}/goals`),

  createGoal: (planId: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<GoalItem>>(`/treatment-plans/${planId}/goals`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateGoal: (goalId: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<GoalItem>>(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  deleteGoal: (goalId: string) =>
    fetcher<ApiResponse<unknown>>(`/goals/${goalId}`, {
      method: 'DELETE',
    }),

  createSubgoal: (goalId: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<SubgoalItem>>(`/goals/${goalId}/subgoals`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateSubgoal: (subgoalId: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<SubgoalItem>>(`/subgoals/${subgoalId}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  deleteSubgoal: (subgoalId: string) =>
    fetcher<ApiResponse<unknown>>(`/subgoals/${subgoalId}`, {
      method: 'DELETE',
    }),

  getProgressEntries: (subgoalId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<ProgressEntryItem[]>>(`/subgoals/${subgoalId}/progress-entries${qs}`);
  },

  createProgressEntry: (subgoalId: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<ProgressEntryItem>>(`/subgoals/${subgoalId}/progress-entries`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getClientSessions: (id: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<unknown[]>>(`/clients/${id}/appointments${qs}`);
  },

  getClientDocuments: (id: string) =>
    fetcher<ApiResponse<unknown[]>>(`/clients/${id}/documents`),

  getClientPaymentPlan: (id: string) =>
    fetcher<ApiResponse<unknown>>(`/clients/${id}/treatment-plans`),

  getClientProgress: (id: string) =>
    fetcher<ApiResponse<unknown[]>>(`/clients/${id}/goals`),
};
