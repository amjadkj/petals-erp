import { SetMetadata } from '@nestjs/common';
import { RoleKey } from '@petals/types';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to specific roles. Used ONLY for fixed Director-only
 * actions (role/permission changes, restore/hard-delete, branch creation).
 * Everything else uses @RequirePermission.
 */
export const Roles = (...roles: RoleKey[]) => SetMetadata(ROLES_KEY, roles);

