import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RequestContext } from '../context/request-context';
import { RoleKey } from '@petals/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<RoleKey[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const reqCtx = RequestContext.current() || request.user;
    const userRoleKey = reqCtx?.roleKey;

    if (!userRoleKey) {
      throw new ForbiddenException('User role is not defined');
    }

    const hasRole = requiredRoles.includes(userRoleKey);
    if (!hasRole) {
      throw new ForbiddenException(
        `Forbidden resource: requires one of roles [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}

