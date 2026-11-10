import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { RoleKey } from '@petals/types';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createMockContext(userRole?: RoleKey) {
    const mockRequest = {
      user: userRole ? { userId: 'u-1', roleKey: userRole } : undefined,
    };

    return {
      getHandler: () => () => {},
      getClass: () => class {},
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow access to public routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true); // isPublic
    const ctx = createMockContext(RoleKey.THERAPIST);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow access when no roles are required on the route', () => {
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(undefined); // requiredRoles

    const ctx = createMockContext(RoleKey.THERAPIST);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow access when user role matches one of required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce([RoleKey.DIRECTOR, RoleKey.MANAGER]);

    const ctx = createMockContext(RoleKey.DIRECTOR);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw ForbiddenException when user role does not match required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce([RoleKey.DIRECTOR]);

    const ctx = createMockContext(RoleKey.THERAPIST);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user role is not present', () => {
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce([RoleKey.DIRECTOR]);

    const ctx = createMockContext(undefined);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});

