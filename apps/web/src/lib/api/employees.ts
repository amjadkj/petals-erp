import { fetcher } from './fetcher';
import type { ApiResponse, UserSummary } from '@petals/types';

export interface EmployeeDto extends UserSummary {
  departmentId?: string | null;
  designation?: string | null;
  joiningDate?: string | null;
  salary?: number | null;
}

export const employeesApi = {
  getEmployees: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<EmployeeDto[]>>(`/employees${qs}`);
  },

  createEmployee: (dto: Partial<EmployeeDto>) =>
    fetcher<ApiResponse<EmployeeDto>>('/employees', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateEmployee: (id: string, dto: Partial<EmployeeDto>) =>
    fetcher<ApiResponse<EmployeeDto>>(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  getEmployee: (id: string) =>
    fetcher<ApiResponse<EmployeeDto>>(`/employees/${id}`),

  getEmployeeSummary: (id: string) =>
    fetcher<ApiResponse<unknown>>(`/employees/${id}/summary`),

  getEmployeeGoals: (id: string) =>
    fetcher<ApiResponse<unknown[]>>(`/employees/${id}/goals`),

  getEmployeeActivityLog: (id: string, cursor?: string) => {
    const qs = cursor ? `?cursor=${cursor}` : '';
    return fetcher<ApiResponse<unknown[]>>(`/employees/${id}/activity${qs}`);
  },
};
