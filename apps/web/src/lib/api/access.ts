import { fetcher } from './fetcher';
import type { ApiResponse, AppModule, PermissionAction, RoleKey } from '@petals/types';

export interface ModulePermissionMap {
  enabled: boolean;
  actions: Record<PermissionAction, boolean>;
}

export type UserPermissionsResponse = {
  roleKey: string;
  permissions?: Record<AppModule, ModulePermissionMap>;
  modules?: Record<AppModule, ModulePermissionMap>;
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

export interface GetUserOverridesResponse {
  user: { id: string; name: string; email: string };
  overrides: UserOverrideDto[];
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

export function normalizeRoleDetail(raw: any): RoleDetailDto {
  if (!raw) return raw;

  let modules: Record<AppModule, { enabled: boolean }> = {} as any;
  if (Array.isArray(raw.modules)) {
    for (const m of raw.modules) {
      modules[m.module as AppModule] = { enabled: Boolean(m.enabled) };
    }
  } else if (raw.modules && typeof raw.modules === 'object') {
    modules = raw.modules;
  }

  let permissions: Record<AppModule, Record<PermissionAction, boolean>> = {} as any;
  if (Array.isArray(raw.permissions)) {
    for (const p of raw.permissions) {
      if (!permissions[p.module as AppModule]) {
        permissions[p.module as AppModule] = {} as Record<PermissionAction, boolean>;
      }
      permissions[p.module as AppModule][p.action as PermissionAction] = Boolean(p.allowed);
    }
  } else if (raw.permissions && typeof raw.permissions === 'object') {
    permissions = raw.permissions;
  }

  return {
    ...raw,
    modules,
    permissions,
  };
}

export const accessApi = {
  getMyPermissions: () =>
    fetcher<ApiResponse<UserPermissionsResponse>>('/access/me/permissions'),

  getRoles: () =>
    fetcher<ApiResponse<RoleDetailDto[]>>('/access/roles'),

  getRole: (key: string) =>
    fetcher<ApiResponse<RoleDetailDto>>(`/access/roles/${key}`),

  updateRoleModules: (
    key: string,
    modules: Record<string, boolean> | Array<{ module: AppModule; enabled: boolean }>,
  ) => {
    const moduleArray = Array.isArray(modules)
      ? modules
      : Object.entries(modules).map(([mod, enabled]) => ({
          module: mod as AppModule,
          enabled: Boolean(enabled),
        }));

    return fetcher<ApiResponse<{ message: string; updatedCount: number }>>(
      `/access/roles/${key}/modules`,
      {
        method: 'PUT',
        body: JSON.stringify({ modules: moduleArray }),
      },
    );
  },

  updateRolePermissions: (
    key: string,
    permissions:
      | Record<string, Record<string, boolean>>
      | Array<{ module: AppModule; action: PermissionAction; allowed: boolean }>,
  ) => {
    let permissionArray: Array<{ module: AppModule; action: PermissionAction; allowed: boolean }>;
    if (Array.isArray(permissions)) {
      permissionArray = permissions;
    } else {
      permissionArray = [];
      for (const [mod, actions] of Object.entries(permissions)) {
        for (const [action, allowed] of Object.entries(actions)) {
          permissionArray.push({
            module: mod as AppModule,
            action: action as PermissionAction,
            allowed: Boolean(allowed),
          });
        }
      }
    }

    return fetcher<ApiResponse<{ message: string; updatedCount: number }>>(
      `/access/roles/${key}/permissions`,
      {
        method: 'PUT',
        body: JSON.stringify({ permissions: permissionArray }),
      },
    );
  },

  getOverrides: (userId: string) =>
    fetcher<ApiResponse<GetUserOverridesResponse>>(`/access/overrides/${userId}`),

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
