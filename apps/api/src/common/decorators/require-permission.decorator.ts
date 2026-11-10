import { SetMetadata } from '@nestjs/common';
import { AppModule, PermissionAction } from '@petals/types';

export const PERMISSION_KEY = 'permission';

export interface PermissionRequirement {
  module: AppModule;
  action: PermissionAction;
}

/**
 * Guards a route with a runtime permission check.
 * Check order (enforced by PermissionGuard):
 *   1. Module enabled for role (RoleModule)
 *   2. User override (UserOverride) beats role setting
 *   3. Role action permission (RolePermission)
 *   4. Scope (VIEW = own/assigned, VIEW_ALL = all in branch)
 * Director always passes.
 */
export const RequirePermission = (module: AppModule, action: PermissionAction) =>
  SetMetadata(PERMISSION_KEY, { module, action } as PermissionRequirement);

