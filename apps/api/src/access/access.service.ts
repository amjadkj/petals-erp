import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma';
import { CacheService } from '../common/redis';
import { RoleKey, AppModule, PermissionAction, PermissionScope } from '@petals/types';

export interface ResolvedModulePermissions {
  enabled: boolean;
  actions: Record<PermissionAction, boolean>;
  scope: PermissionScope;
}

export type ResolvedPermissionsMap = Record<AppModule, ResolvedModulePermissions>;

@Injectable()
export class AccessService {
  private readonly logger = new Logger(AccessService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /**
   * Resolves permission for a user request against module and action.
   * Order of evaluation:
   *  1. Director is always allowed (scope: ALL).
   *  2. Module enabled for role (RoleModule).
   *  3. User override (UserOverride) beats role permission.
   *  4. Role action permission (RolePermission).
   *  5. Action dependency check: CREATE / UPDATE / DELETE require VIEW.
   *  6. Scope determination: VIEW without VIEW_ALL = scoped (ASSIGNED / OWN).
   */
  async resolvePermission(
    userId: string,
    roleId: string,
    roleKey: RoleKey,
    module: AppModule,
    action: PermissionAction,
  ): Promise<{ allowed: boolean; scope: PermissionScope; reason?: string }> {
    // 1. Director is ALWAYS allowed
    if (roleKey === RoleKey.DIRECTOR) {
      return { allowed: true, scope: PermissionScope.ALL };
    }

    const permsMap = await this.getOrLoadUserPermissionsMap(userId, roleId, roleKey);
    const modPerm = permsMap[module];

    // 2. Check if module is enabled
    if (!modPerm || !modPerm.enabled) {
      return {
        allowed: false,
        scope: PermissionScope.OWN,
        reason: `Module ${module} is disabled for this role`,
      };
    }

    // 3 & 4. Check action permission
    const actionAllowed = modPerm.actions[action];
    if (!actionAllowed) {
      return {
        allowed: false,
        scope: PermissionScope.OWN,
        reason: `Action ${action} on module ${module} is not permitted`,
      };
    }

    // 5. Dependency check: CREATE, UPDATE, DELETE require VIEW
    if (
      action === PermissionAction.CREATE ||
      action === PermissionAction.UPDATE ||
      action === PermissionAction.DELETE
    ) {
      if (!modPerm.actions[PermissionAction.VIEW]) {
        return {
          allowed: false,
          scope: PermissionScope.OWN,
          reason: `Action ${action} requires VIEW permission on module ${module}`,
        };
      }
    }

    // 6. Determine scope
    let scope = PermissionScope.ALL;
    if (modPerm.actions[PermissionAction.VIEW_ALL]) {
      scope = PermissionScope.ALL;
    } else if (modPerm.actions[PermissionAction.VIEW]) {
      if (roleKey === RoleKey.PARENT) {
        scope = PermissionScope.OWN;
      } else if (roleKey === RoleKey.THERAPIST) {
        scope = PermissionScope.ASSIGNED;
      } else {
        scope = PermissionScope.ASSIGNED;
      }
    }

    return { allowed: true, scope };
  }

  /**
   * Returns complete resolved permissions map for a user (for UI menu/view state).
   */
  async getUserPermissions(
    userId: string,
  ): Promise<{ roleKey: RoleKey; permissions: ResolvedPermissionsMap }> {
    const user = await this.prisma.unscopedClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        roleId: true,
        role: { select: { key: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roleKey = user.role.key as unknown as RoleKey;
    const permissions = await this.getOrLoadUserPermissionsMap(
      user.id,
      user.roleId,
      roleKey,
    );

    return { roleKey, permissions };
  }

  /**
   * Internal cache loader for user's resolved permissions.
   */
  private async getOrLoadUserPermissionsMap(
    userId: string,
    roleId: string,
    roleKey: RoleKey,
  ): Promise<ResolvedPermissionsMap> {
    const cacheKey = `user_perms:${userId}`;
    const cached = await this.cache.get<ResolvedPermissionsMap>(cacheKey);
    if (cached) {
      return cached;
    }

    // 1. Fetch role modules
    const roleModules = await this.prisma.unscopedClient.roleModule.findMany({
      where: { roleId },
    });

    // 2. Fetch role permissions
    const rolePermissions = await this.prisma.unscopedClient.rolePermission.findMany({
      where: { roleId },
    });

    // 3. Fetch user overrides
    const userOverrides = await this.prisma.unscopedClient.userOverride.findMany({
      where: { userId },
    });

    const modulesMap = new Map<string, boolean>();
    for (const rm of roleModules) {
      modulesMap.set(rm.module, rm.enabled);
    }

    const rolePermsMap = new Map<string, boolean>();
    for (const rp of rolePermissions) {
      rolePermsMap.set(`${rp.module}:${rp.action}`, rp.allowed);
    }

    const overridesMap = new Map<string, boolean>();
    for (const uo of userOverrides) {
      overridesMap.set(`${uo.module}:${uo.action}`, uo.allowed);
    }

    const result: Partial<ResolvedPermissionsMap> = {};

    for (const mod of Object.values(AppModule)) {
      // If director, everything enabled & allowed
      const isDirector = roleKey === RoleKey.DIRECTOR;
      const enabled = isDirector ? true : (modulesMap.get(mod) ?? false);

      const actions: Record<PermissionAction, boolean> = {
        [PermissionAction.CREATE]: false,
        [PermissionAction.UPDATE]: false,
        [PermissionAction.VIEW]: false,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      };

      for (const act of Object.values(PermissionAction)) {
        if (isDirector) {
          actions[act] = true;
          continue;
        }

        // User override takes precedence over role permission
        const overrideKey = `${mod}:${act}`;
        if (overridesMap.has(overrideKey)) {
          actions[act] = overridesMap.get(overrideKey)!;
        } else {
          actions[act] = rolePermsMap.get(overrideKey) ?? false;
        }
      }

      // Compute default scope for this module
      let scope = PermissionScope.ALL;
      if (actions[PermissionAction.VIEW_ALL]) {
        scope = PermissionScope.ALL;
      } else if (actions[PermissionAction.VIEW]) {
        if (roleKey === RoleKey.PARENT) {
          scope = PermissionScope.OWN;
        } else if (roleKey === RoleKey.THERAPIST) {
          scope = PermissionScope.ASSIGNED;
        } else {
          scope = PermissionScope.ASSIGNED;
        }
      }

      result[mod] = {
        enabled,
        actions,
        scope,
      };
    }

    const finalMap = result as ResolvedPermissionsMap;
    // Cache for 10 minutes (invalidated on any permission/role update)
    await this.cache.set(cacheKey, finalMap, 600);
    return finalMap;
  }

  // ──────────────────────── Director Endpoints ────────────────────────

  /**
   * List all roles with modules and action permissions.
   */
  async listRolesWithPermissions() {
    const roles = await this.prisma.unscopedClient.role.findMany({
      include: {
        modules: true,
        permissions: true,
      },
      orderBy: { key: 'asc' },
    });

    return roles;
  }

  /**
   * Get permissions for a specific role.
   */
  async getRolePermissions(roleKey: RoleKey) {
    const role = await this.prisma.unscopedClient.role.findUnique({
      where: { key: roleKey },
      include: {
        modules: true,
        permissions: true,
      },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleKey} not found`);
    }

    return role;
  }

  /**
   * Update module enabled status for a role.
   */
  async updateRoleModules(
    roleKey: RoleKey,
    modules: { module: AppModule; enabled: boolean }[],
    directorUserId: string,
    ipAddress?: string,
  ) {
    const role = await this.prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: roleKey },
    });

    // Director cannot disable its own modules
    if (role.key === RoleKey.DIRECTOR) {
      throw new ForbiddenException('Director permissions cannot be modified');
    }

    for (const item of modules) {
      await this.prisma.unscopedClient.roleModule.upsert({
        where: {
          roleId_module: {
            roleId: role.id,
            module: item.module,
          },
        },
        update: { enabled: item.enabled },
        create: {
          roleId: role.id,
          module: item.module,
          enabled: item.enabled,
        },
      });
    }

    // Invalidate caches
    await this.invalidateAllUserPermissions();

    // Audit log
    await this.writeAuditLog({
      userId: directorUserId,
      action: 'UPDATE_ROLE_MODULES',
      entity: 'Role',
      entityId: role.id,
      metadata: { roleKey, updatedModules: modules },
      ipAddress,
    });

    return { message: 'Role modules updated successfully' };
  }

  /**
   * Update action permissions for a role.
   */
  async updateRolePermissions(
    roleKey: RoleKey,
    permissions: { module: AppModule; action: PermissionAction; allowed: boolean }[],
    directorUserId: string,
    ipAddress?: string,
  ) {
    const role = await this.prisma.unscopedClient.role.findUniqueOrThrow({
      where: { key: roleKey },
    });

    if (role.key === RoleKey.DIRECTOR) {
      throw new ForbiddenException('Director permissions cannot be modified');
    }

    for (const item of permissions) {
      await this.prisma.unscopedClient.rolePermission.upsert({
        where: {
          roleId_module_action: {
            roleId: role.id,
            module: item.module,
            action: item.action,
          },
        },
        update: { allowed: item.allowed },
        create: {
          roleId: role.id,
          module: item.module,
          action: item.action,
          allowed: item.allowed,
        },
      });
    }

    // Invalidate caches
    await this.invalidateAllUserPermissions();

    // Audit log
    await this.writeAuditLog({
      userId: directorUserId,
      action: 'UPDATE_ROLE_PERMISSIONS',
      entity: 'Role',
      entityId: role.id,
      metadata: { roleKey, updatedPermissions: permissions },
      ipAddress,
    });

    return { message: 'Role permissions updated successfully' };
  }

  /**
   * Get overrides for a specific user.
   */
  async getUserOverrides(targetUserId: string) {
    const user = await this.prisma.unscopedClient.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const overrides = await this.prisma.unscopedClient.userOverride.findMany({
      where: { userId: targetUserId },
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });

    return { user, overrides };
  }

  /**
   * Update or upsert user overrides.
   */
  async updateUserOverrides(
    targetUserId: string,
    overrides: { module: AppModule; action: PermissionAction; allowed: boolean }[],
    directorUserId: string,
    ipAddress?: string,
  ) {
    const user = await this.prisma.unscopedClient.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: { select: { key: true } } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role.key === RoleKey.DIRECTOR) {
      throw new ForbiddenException('Cannot set overrides on Director accounts');
    }

    for (const item of overrides) {
      await this.prisma.unscopedClient.userOverride.upsert({
        where: {
          userId_module_action: {
            userId: targetUserId,
            module: item.module,
            action: item.action,
          },
        },
        update: { allowed: item.allowed },
        create: {
          userId: targetUserId,
          module: item.module,
          action: item.action,
          allowed: item.allowed,
        },
      });
    }

    // Invalidate this user's cache immediately
    await this.invalidateUserPermissions(targetUserId);

    // Audit log
    await this.writeAuditLog({
      userId: directorUserId,
      action: 'UPDATE_USER_OVERRIDES',
      entity: 'UserOverride',
      entityId: targetUserId,
      metadata: { targetUserId, overrides },
      ipAddress,
    });

    return { message: 'User overrides updated successfully' };
  }

  /**
   * Delete a specific override.
   */
  async deleteUserOverride(
    targetUserId: string,
    module: AppModule,
    action: PermissionAction,
    directorUserId: string,
    ipAddress?: string,
  ) {
    await this.prisma.unscopedClient.userOverride.deleteMany({
      where: {
        userId: targetUserId,
        module,
        action,
      },
    });

    await this.invalidateUserPermissions(targetUserId);

    await this.writeAuditLog({
      userId: directorUserId,
      action: 'DELETE_USER_OVERRIDE',
      entity: 'UserOverride',
      entityId: targetUserId,
      metadata: { targetUserId, module, action },
      ipAddress,
    });

    return { message: 'User override deleted' };
  }

  /**
   * Invalidate cached permissions for a single user.
   */
  async invalidateUserPermissions(userId: string): Promise<void> {
    await this.cache.del(`user_perms:${userId}`);
  }

  /**
   * Invalidate all cached user permissions.
   */
  async invalidateAllUserPermissions(): Promise<void> {
    await this.cache.deleteByPrefix('user_perms:');
  }

  /**
   * Temporary audit log writer until Phase 06.
   */
  private async writeAuditLog(params: {
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    branchId?: string;
    metadata?: any;
    ipAddress?: string;
  }) {
    try {
      await this.prisma.unscopedClient.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          branchId: params.branchId,
          metadata: params.metadata,
          ipAddress: params.ipAddress,
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to write audit log: ${(err as Error).message}`);
    }
  }
}

