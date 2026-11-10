import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as public — no authentication required.
 * Skips AuthGuard, RolesGuard, and PermissionGuard.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

