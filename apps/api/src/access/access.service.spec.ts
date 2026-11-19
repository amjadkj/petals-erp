import { AccessService } from './access.service';
import { AppModule, PermissionAction, PermissionScope, RoleKey } from '@petals/types';

describe('AccessService', () => {
  let service: AccessService;
  let mockPrisma: any;
  let mockCache: any;
  let mockAuditService: any;

  beforeEach(() => {
    mockPrisma = {
      unscopedClient: {
        role: {
          findMany: jest.fn(),
          findUnique: jest.fn(),
          findUniqueOrThrow: jest.fn(),
        },
        roleModule: {
          findMany: jest.fn(),
          upsert: jest.fn(),
        },
        rolePermission: {
          findMany: jest.fn(),
          upsert: jest.fn(),
        },
        userOverride: {
          findMany: jest.fn(),
          upsert: jest.fn(),
          deleteMany: jest.fn(),
        },
        user: {
          findUnique: jest.fn(),
        },
        auditLog: {
          create: jest.fn(),
        },
      },
    };

    mockCache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      deleteByPrefix: jest.fn().mockResolvedValue(1),
    };

    mockAuditService = {
      log: jest.fn().mockResolvedValue(null),
    };

    service = new AccessService(mockPrisma, mockCache, mockAuditService as any);
  });

  describe('resolvePermission', () => {
    it('should always allow Director with scope ALL', async () => {
      const result = await service.resolvePermission(
        'director-1',
        'role-director',
        RoleKey.DIRECTOR,
        AppModule.ROLE_ACCESS,
        PermissionAction.DELETE,
      );

      expect(result.allowed).toBe(true);
      expect(result.scope).toBe(PermissionScope.ALL);
      expect(mockPrisma.unscopedClient.roleModule.findMany).not.toHaveBeenCalled();
    });

    it('should deny access if the module is disabled for the role', async () => {
      // Role has FINANCIAL_PNL disabled
      mockPrisma.unscopedClient.roleModule.findMany.mockResolvedValue([
        { roleId: 'role-mgr', module: AppModule.FINANCIAL_PNL, enabled: false },
      ]);
      mockPrisma.unscopedClient.rolePermission.findMany.mockResolvedValue([]);
      mockPrisma.unscopedClient.userOverride.findMany.mockResolvedValue([]);

      const result = await service.resolvePermission(
        'user-mgr',
        'role-mgr',
        RoleKey.MANAGER,
        AppModule.FINANCIAL_PNL,
        PermissionAction.VIEW,
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('disabled');
    });

    it('should allow user override to grant permission when role denied it', async () => {
      // Role has module enabled, but CREATE action is false
      mockPrisma.unscopedClient.roleModule.findMany.mockResolvedValue([
        { roleId: 'role-therapist', module: AppModule.CLIENTS, enabled: true },
      ]);
      mockPrisma.unscopedClient.rolePermission.findMany.mockResolvedValue([
        { roleId: 'role-therapist', module: AppModule.CLIENTS, action: PermissionAction.VIEW, allowed: true },
        { roleId: 'role-therapist', module: AppModule.CLIENTS, action: PermissionAction.CREATE, allowed: false },
      ]);
      // User override gives CREATE: true
      mockPrisma.unscopedClient.userOverride.findMany.mockResolvedValue([
        { userId: 'user-special-therapist', module: AppModule.CLIENTS, action: PermissionAction.CREATE, allowed: true },
      ]);

      const result = await service.resolvePermission(
        'user-special-therapist',
        'role-therapist',
        RoleKey.THERAPIST,
        AppModule.CLIENTS,
        PermissionAction.CREATE,
      );

      expect(result.allowed).toBe(true);
    });

    it('should allow user override to revoke permission when role allowed it', async () => {
      mockPrisma.unscopedClient.roleModule.findMany.mockResolvedValue([
        { roleId: 'role-mgr', module: AppModule.CLIENTS, enabled: true },
      ]);
      mockPrisma.unscopedClient.rolePermission.findMany.mockResolvedValue([
        { roleId: 'role-mgr', module: AppModule.CLIENTS, action: PermissionAction.VIEW, allowed: true },
        { roleId: 'role-mgr', module: AppModule.CLIENTS, action: PermissionAction.DELETE, allowed: true },
      ]);
      // User override revokes DELETE
      mockPrisma.unscopedClient.userOverride.findMany.mockResolvedValue([
        { userId: 'user-mgr', module: AppModule.CLIENTS, action: PermissionAction.DELETE, allowed: false },
      ]);

      const result = await service.resolvePermission(
        'user-mgr',
        'role-mgr',
        RoleKey.MANAGER,
        AppModule.CLIENTS,
        PermissionAction.DELETE,
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not permitted');
    });

    it('should require VIEW permission for CREATE, UPDATE, or DELETE actions', async () => {
      mockPrisma.unscopedClient.roleModule.findMany.mockResolvedValue([
        { roleId: 'role-1', module: AppModule.CLIENTS, enabled: true },
      ]);
      // User has CREATE allowed, but VIEW is not allowed
      mockPrisma.unscopedClient.rolePermission.findMany.mockResolvedValue([
        { roleId: 'role-1', module: AppModule.CLIENTS, action: PermissionAction.CREATE, allowed: true },
        { roleId: 'role-1', module: AppModule.CLIENTS, action: PermissionAction.VIEW, allowed: false },
      ]);
      mockPrisma.unscopedClient.userOverride.findMany.mockResolvedValue([]);

      const result = await service.resolvePermission(
        'user-1',
        'role-1',
        RoleKey.THERAPIST,
        AppModule.CLIENTS,
        PermissionAction.CREATE,
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('requires VIEW permission');
    });

    it('should assign ASSIGNED scope for Therapist when only VIEW is present', async () => {
      mockPrisma.unscopedClient.roleModule.findMany.mockResolvedValue([
        { roleId: 'role-therapist', module: AppModule.CLIENTS, enabled: true },
      ]);
      mockPrisma.unscopedClient.rolePermission.findMany.mockResolvedValue([
        { roleId: 'role-therapist', module: AppModule.CLIENTS, action: PermissionAction.VIEW, allowed: true },
        { roleId: 'role-therapist', module: AppModule.CLIENTS, action: PermissionAction.VIEW_ALL, allowed: false },
      ]);
      mockPrisma.unscopedClient.userOverride.findMany.mockResolvedValue([]);

      const result = await service.resolvePermission(
        'user-therapist',
        'role-therapist',
        RoleKey.THERAPIST,
        AppModule.CLIENTS,
        PermissionAction.VIEW,
      );

      expect(result.allowed).toBe(true);
      expect(result.scope).toBe(PermissionScope.ASSIGNED);
    });

    it('should assign OWN scope for Parent when only VIEW is present', async () => {
      mockPrisma.unscopedClient.roleModule.findMany.mockResolvedValue([
        { roleId: 'role-parent', module: AppModule.PROFILE_OVERVIEW, enabled: true },
      ]);
      mockPrisma.unscopedClient.rolePermission.findMany.mockResolvedValue([
        { roleId: 'role-parent', module: AppModule.PROFILE_OVERVIEW, action: PermissionAction.VIEW, allowed: true },
        { roleId: 'role-parent', module: AppModule.PROFILE_OVERVIEW, action: PermissionAction.VIEW_ALL, allowed: false },
      ]);
      mockPrisma.unscopedClient.userOverride.findMany.mockResolvedValue([]);

      const result = await service.resolvePermission(
        'user-parent',
        'role-parent',
        RoleKey.PARENT,
        AppModule.PROFILE_OVERVIEW,
        PermissionAction.VIEW,
      );

      expect(result.allowed).toBe(true);
      expect(result.scope).toBe(PermissionScope.OWN);
    });

    it('should assign ALL scope when VIEW_ALL is granted', async () => {
      mockPrisma.unscopedClient.roleModule.findMany.mockResolvedValue([
        { roleId: 'role-mgr', module: AppModule.CLIENTS, enabled: true },
      ]);
      mockPrisma.unscopedClient.rolePermission.findMany.mockResolvedValue([
        { roleId: 'role-mgr', module: AppModule.CLIENTS, action: PermissionAction.VIEW, allowed: true },
        { roleId: 'role-mgr', module: AppModule.CLIENTS, action: PermissionAction.VIEW_ALL, allowed: true },
      ]);
      mockPrisma.unscopedClient.userOverride.findMany.mockResolvedValue([]);

      const result = await service.resolvePermission(
        'user-mgr',
        'role-mgr',
        RoleKey.MANAGER,
        AppModule.CLIENTS,
        PermissionAction.VIEW,
      );

      expect(result.allowed).toBe(true);
      expect(result.scope).toBe(PermissionScope.ALL);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate all user permission caches when role permissions are updated', async () => {
      mockPrisma.unscopedClient.role.findUniqueOrThrow.mockResolvedValue({
        id: 'role-mgr-id',
        key: RoleKey.MANAGER,
      });

      await service.updateRolePermissions(
        RoleKey.MANAGER,
        [{ module: AppModule.REPORTS, action: PermissionAction.VIEW, allowed: true }],
        'director-1',
      );

      expect(mockCache.deleteByPrefix).toHaveBeenCalledWith('user_perms:');
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should invalidate specific user cache when user override is updated', async () => {
      mockPrisma.unscopedClient.user.findUnique.mockResolvedValue({
        id: 'target-user-1',
        role: { key: RoleKey.THERAPIST },
      });

      await service.updateUserOverrides(
        'target-user-1',
        [{ module: AppModule.CLIENTS, action: PermissionAction.CREATE, allowed: true }],
        'director-1',
      );

      expect(mockCache.del).toHaveBeenCalledWith('user_perms:target-user-1');
      expect(mockAuditService.log).toHaveBeenCalled();
    });
  });

  describe('Role Detail Formatting', () => {
    it('listRolesWithPermissions formats modules and permissions arrays into dictionary maps', async () => {
      mockPrisma.unscopedClient.role.findMany.mockResolvedValue([
        {
          id: 'role-mgr-id',
          key: RoleKey.MANAGER,
          name: 'Manager',
          description: 'Front office admin',
          isSystem: true,
          _count: { users: 3 },
          modules: [
            { roleId: 'role-mgr-id', module: AppModule.APPOINTMENTS, enabled: true },
            { roleId: 'role-mgr-id', module: AppModule.FINANCIAL_PNL, enabled: false },
          ],
          permissions: [
            { roleId: 'role-mgr-id', module: AppModule.APPOINTMENTS, action: PermissionAction.VIEW, allowed: true },
            { roleId: 'role-mgr-id', module: AppModule.APPOINTMENTS, action: PermissionAction.CREATE, allowed: true },
          ],
        },
      ]);

      const result = await service.listRolesWithPermissions();

      expect(result).toHaveLength(1);
      const mgr = result[0];
      expect(mgr.id).toBe('role-mgr-id');
      expect(mgr.key).toBe(RoleKey.MANAGER);
      expect(mgr.userCount).toBe(3);
      expect(mgr.modules[AppModule.APPOINTMENTS]).toEqual({ enabled: true });
      expect(mgr.modules[AppModule.FINANCIAL_PNL]).toEqual({ enabled: false });
      expect(mgr.permissions[AppModule.APPOINTMENTS][PermissionAction.VIEW]).toBe(true);
      expect(mgr.permissions[AppModule.APPOINTMENTS][PermissionAction.CREATE]).toBe(true);
    });

    it('getRolePermissions returns mapped role for roleKey', async () => {
      mockPrisma.unscopedClient.role.findUnique.mockResolvedValue({
        id: 'role-therapist-id',
        key: RoleKey.THERAPIST,
        name: 'Therapist',
        description: 'Clinical specialist',
        isSystem: true,
        _count: { users: 5 },
        modules: [
          { roleId: 'role-therapist-id', module: AppModule.CLIENTS, enabled: true },
        ],
        permissions: [
          { roleId: 'role-therapist-id', module: AppModule.CLIENTS, action: PermissionAction.VIEW, allowed: true },
        ],
      });

      const result = await service.getRolePermissions(RoleKey.THERAPIST);

      expect(result.id).toBe('role-therapist-id');
      expect(result.userCount).toBe(5);
      expect(result.modules[AppModule.CLIENTS]).toEqual({ enabled: true });
      expect(result.permissions[AppModule.CLIENTS][PermissionAction.VIEW]).toBe(true);
    });
  });
});

