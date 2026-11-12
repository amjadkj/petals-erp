import { fetcher } from './fetcher';
import type { ApiResponse, BranchDto, UserSummary } from '@petals/types';

export const branchesApi = {
  getBranches: () =>
    fetcher<ApiResponse<BranchDto[]>>('/branches', {}, { skipBranchId: true }),

  createBranch: (dto: Partial<BranchDto>) =>
    fetcher<ApiResponse<BranchDto>>('/branches', {
      method: 'POST',
      body: JSON.stringify(dto),
    }, { skipBranchId: true }),

  updateBranch: (id: string, dto: Partial<BranchDto>) =>
    fetcher<ApiResponse<BranchDto>>(`/branches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }, { skipBranchId: true }),

  deactivateBranch: (id: string) =>
    fetcher<ApiResponse<BranchDto>>(`/branches/${id}/deactivate`, {
      method: 'POST',
    }, { skipBranchId: true }),

  getUsers: () =>
    fetcher<ApiResponse<UserSummary[]>>('/users'),

  assignUserBranches: (userId: string, dto: { branchIds: string[] }) =>
    fetcher<ApiResponse<unknown>>(`/users/${userId}/branches`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
};
