import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from './permission.guard';
import { AppModule, PermissionAction, PermissionScope, RoleKey } from '@petals/types';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;
  let accessService: any;

  beforeEach(() => {
    reflector = new Reflector();
    accessService = {
      resolvePermission: jest.fn(),
    };
    guard = new PermissionGuard(reflector, accessService);
  });

  function createMockContext(user?: { userId: string; roleId?: string; roleKey: RoleKey }) {
    const mockRequest: any = {
      user,
    };

    return {
      getHandler: () => () => {},
      getClass: () => class {},
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow public routes', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true); // isPublic
    const ctx = createMockContext({ userId: 'u-1', roleKey: RoleKey.THERAPIST });
    expect(await guard.canActivate(ctx)).toBe(true);
  });

  it('should pass through routes without @RequirePermission metadata', async () => {
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(undefined); // requirement

    const ctx = createMockContext({ userId: 'u-1', roleKey: RoleKey.THERAPIST });
    expect(await guard.canActivate(ctx)).toBe(true);
  });

  it('should throw UnauthorizedException if user is not authenticated', async () => {
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce({ module: AppModule.CLIENTS, action: PermissionAction.VIEW });

    const ctx = createMockContext(undefined);
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should always allow Director without checking access service', async () => {
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce({ module: AppModule.ROLE_ACCESS, action: PermissionAction.UPDATE });

    const ctx = createMockContext({ userId: 'u-1', roleKey: RoleKey.DIRECTOR });
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(accessService.resolvePermission).not.toHaveBeenCalled();
  });

  it('should allow access and attach scope when permission is granted', async () => {
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce({ module: AppModule.CLIENTS, action: PermissionAction.VIEW });

    accessService.resolvePermission.mockResolvedValue({
      allowed: true,
      scope: PermissionScope.ASSIGNED,
    });

    const ctx = createMockContext({
      userId: 'u-therapist',
      roleId: 'r-therapist',
      roleKey: RoleKey.THERAPIST,
    });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);

    const req = ctx.switchToHttp().getRequest();
    expect(req.permissionScope).toBe(PermissionScope.ASSIGNED);
  });

  it('should throw ForbiddenException when permission is denied', async () => {
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce({ module: AppModule.FINANCIAL_PNL, action: PermissionAction.VIEW });

    accessService.resolvePermission.mockResolvedValue({
      allowed: false,
      scope: PermissionScope.OWN,
      reason: 'Module FINANCIAL_PNL is disabled for this role',
    });

    const ctx = createMockContext({
      userId: 'u-manager',
      roleId: 'r-manager',
      roleKey: RoleKey.MANAGER,
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});

