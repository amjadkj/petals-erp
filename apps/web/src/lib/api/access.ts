import { fetcher } from './fetcher';
import type { ApiResponse, AppModule, PermissionAction, RoleKey } from '@petals/types';

export interface ModulePermissionMap {
  enabled: boolean;
  actions: Record<PermissionAction, boolean>;
}

export type UserPermissionsResponse = {
  roleKey: string;
  modules: Record<AppModule, ModulePermissionMap>;
};

export interface RoleDetailDto {
  id: string;
  key: RoleKey;
  name: string;
  description?: string | null;
  isSystem: boolean;
  modules: Record<AppModule, { enabled: boolean }>;
  permissions: Record<AppModule, Record<PermissionAction, boolean>>;
  userCount?: number;
}

export interface UserOverrideDto {
  id: string;
  userId: string;
  module: AppModule;
  action: PermissionAction;
  allowed: boolean;
  createdAt: string;
}

export interface AuditLogDto {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  branchId: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export const accessApi = {
  getMyPermissions: () =>
    fetcher<ApiResponse<UserPermissionsResponse>>('/access/me/permissions'),

  getRoles: () =>
    fetcher<ApiResponse<RoleDetailDto[]>>('/access/roles'),

  getRole: (key: string) =>
    fetcher<ApiResponse<RoleDetailDto>>(`/access/roles/${key}`),

  updateRoleModules: (key: string, modules: Record<string, boolean>) =>
    fetcher<ApiResponse<{ message: string; updatedCount: number }>>(
      `/access/roles/${key}/modules`,
      {
        method: 'PUT',
        body: JSON.stringify({ modules }),
      },
    ),

  updateRolePermissions: (
    key: string,
    permissions: Record<string, Record<string, boolean>>,
  ) =>
    fetcher<ApiResponse<{ message: string; updatedCount: number }>>(
      `/access/roles/${key}/permissions`,
      {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
      },
    ),

  getOverrides: (userId: string) =>
    fetcher<ApiResponse<UserOverrideDto[]>>(`/access/overrides/${userId}`),

  setOverrides: (
    userId: string,
    overrides: Array<{ module: AppModule; action: PermissionAction; allowed: boolean }>,
  ) =>
    fetcher<ApiResponse<{ count: number; overrides: UserOverrideDto[] }>>(
      `/access/overrides/${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ overrides }),
      },
    ),

  clearOverride: (userId: string, module: AppModule, action: PermissionAction) =>
    fetcher<ApiResponse<{ message: string }>>(
      `/access/overrides/${userId}?module=${module}&action=${action}`,
      {
        method: 'DELETE',
      },
    ),

  getAuditLogs: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<AuditLogDto[]>>(`/audit-logs${qs}`);
  },
};
