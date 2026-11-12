import { fetcher } from './fetcher';
import type { ApiResponse, BranchDto, RoleKey, UserSummary } from '@petals/types';

export type { BranchDto };

export interface UserBranchAssignmentDto extends UserSummary {
  branches?: Array<{
    id: string;
    branchId: string;
    isPrimary: boolean;
    branch?: BranchDto;
  }>;
  role?: {
    id: string;
    key: RoleKey;
    name: string;
  };
}

export interface BranchWithStatsDto extends BranchDto {
  userCount?: number;
  clientCount?: number;
  roomsCount?: number;
}

export const branchesApi = {
  getBranches: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<BranchDto[]>>(`/branches${qs}`, {}, { skipBranchId: true });
  },

  getBranch: (id: string) =>
    fetcher<ApiResponse<BranchDto>>(`/branches/${id}`, {}, { skipBranchId: true }),

  createBranch: (dto: Partial<BranchDto>) =>
    fetcher<ApiResponse<BranchDto>>(
      '/branches',
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
      { skipBranchId: true },
    ),

  updateBranch: (id: string, dto: Partial<BranchDto>) =>
    fetcher<ApiResponse<BranchDto>>(
      `/branches/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(dto),
      },
      { skipBranchId: true },
    ),

  deactivateBranch: (id: string) =>
    fetcher<ApiResponse<BranchDto>>(
      `/branches/${id}`,
      {
        method: 'DELETE',
      },
      { skipBranchId: true },
    ),

  getUsers: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<UserBranchAssignmentDto[]>>(`/users${qs}`);
  },

  assignUserBranches: (userId: string, dto: { branchIds: string[]; primaryBranchId?: string }) =>
    fetcher<ApiResponse<unknown>>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        branches: dto.branchIds.map((bId) => ({
          branchId: bId,
          isPrimary: dto.primaryBranchId ? bId === dto.primaryBranchId : false,
        })),
      }),
    }),
};
