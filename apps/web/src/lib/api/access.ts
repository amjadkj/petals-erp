import { fetcher } from './fetcher';
import type { ApiResponse, AppModule, PermissionAction } from '@petals/types';

export interface ModulePermissionMap {
  enabled: boolean;
  actions: Record<PermissionAction, boolean>;
}

export type UserPermissionsResponse = {
  roleKey: string;
  modules: Record<AppModule, ModulePermissionMap>;
};

export const accessApi = {
  getMyPermissions: () =>
    fetcher<ApiResponse<UserPermissionsResponse>>('/access/me/permissions'),

  getRoles: () =>
    fetcher<ApiResponse<unknown[]>>('/access/roles'),

  getRole: (key: string) =>
    fetcher<ApiResponse<unknown>>(`/access/roles/${key}`),

  updateRoleModules: (key: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>(`/access/roles/${key}/modules`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  updateRolePermissions: (key: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>(`/access/roles/${key}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  getOverrides: (userId: string) =>
    fetcher<ApiResponse<unknown[]>>(`/access/users/${userId}/overrides`),

  setOverrides: (userId: string, dto: Record<string, unknown>) =>
    fetcher<ApiResponse<unknown>>(`/access/users/${userId}/overrides`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  clearOverride: (userId: string, module: string, action: string) =>
    fetcher<ApiResponse<unknown>>(`/access/users/${userId}/overrides/${module}/${action}`, {
      method: 'DELETE',
    }),

  getAuditLogs: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<ApiResponse<unknown[]>>(`/access/audit-logs${qs}`);
  },
};
