import { fetcher } from './fetcher';
import type { ApiResponse, DepartmentDto } from '@petals/types';

export const departmentsApi = {
  getDepartments: () =>
    fetcher<ApiResponse<DepartmentDto[]>>('/departments', {}, { skipBranchId: true }),

  getDepartment: (id: string) =>
    fetcher<ApiResponse<DepartmentDto>>(`/departments/${id}`, {}, { skipBranchId: true }),
};
