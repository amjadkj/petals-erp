import { fetcher } from './fetcher';
import type { ApiResponse, RoleKey, UserSummary } from '@petals/types';

export interface EmployeeDto extends UserSummary {
  departmentId?: string | null;
  designation?: string | null;
  joiningDate?: string | null;
  joinedOn?: string | null;
  salary?: number | null;
  employeeCode?: string;
  department?: { id: string; name: string; code: string } | null;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    isActive: boolean;
    role?: { id: string; key: RoleKey; name: string };
    branches?: Array<{
      branchId: string;
      isPrimary: boolean;
      branch: { id: string; name: string; code: string; city?: string | null };
    }>;
  };
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  roleKey?: RoleKey;
  branchId: string;
  departmentId?: string;
  departmentName?: string;
  designation?: string;
  employeeCode?: string;
  salary?: number;
  joinedOn?: string;
}

export const employeesApi = {
  getEmployees: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<EmployeeDto[]>>(`/employees${qs}`);
  },

  createEmployee: (dto: CreateEmployeePayload | Partial<EmployeeDto>) =>
    fetcher<ApiResponse<EmployeeDto>>('/employees', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateEmployee: (
    id: string,
    dto: Partial<EmployeeDto> & { branchId?: string; phone?: string; name?: string },
  ) =>
    fetcher<ApiResponse<EmployeeDto>>(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  getEmployee: (id: string) =>
    fetcher<ApiResponse<EmployeeDto>>(`/employees/${id}`),

  getEmployeeSummary: (id: string) =>
    fetcher<ApiResponse<unknown>>(`/employees/${id}/summary`),

  getEmployeeGoals: (id: string) =>
    fetcher<ApiResponse<unknown[]>>(`/hr/employees/${id}/goals`),

  getEmployeeActivityLog: (id: string, cursor?: string) => {
    const qs = cursor ? `?cursor=${cursor}` : '';
    return fetcher<ApiResponse<unknown[]>>(`/hr/employees/${id}/activity-log${qs}`);
  },
};
