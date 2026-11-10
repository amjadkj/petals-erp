import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, PermissionRequirement } from '../decorators/require-permission.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RequestContext } from '../context/request-context';
import { AccessService } from '../../access/access.service';
import { RoleKey, PermissionScope } from '@petals/types';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessService: AccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requirement = this.reflector.getAllAndOverride<PermissionRequirement | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If route doesn't have @RequirePermission, pass through
    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const reqCtx = RequestContext.current() || request.user;

    if (!reqCtx || !reqCtx.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    // The Director is ALWAYS allowed
    if (reqCtx.roleKey === RoleKey.DIRECTOR) {
      reqCtx.permissionScope = PermissionScope.ALL;
      (request as any).permissionScope = PermissionScope.ALL;
      return true;
    }

    const result = await this.accessService.resolvePermission(
      reqCtx.userId,
      reqCtx.roleId,
      reqCtx.roleKey,
      requirement.module,
      requirement.action,
    );

    if (!result.allowed) {
      throw new ForbiddenException(result.reason || 'Insufficient permissions');
    }

    // Attach resolved scope to request context for downstream services
    if (reqCtx) {
      reqCtx.permissionScope = result.scope;
    }
    (request as any).permissionScope = result.scope;

    return true;
  }
}

