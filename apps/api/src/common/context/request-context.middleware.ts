import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContext, IRequestContext } from './request-context';

/**
 * Wraps each request in an AsyncLocalStorage context.
 * The actual user/role/branch data is populated by AuthGuard (Phase 03).
 * This middleware only sets up the storage scope.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // Start with an empty context; AuthGuard will populate it later
    const ctx: IRequestContext = {
      userId: '',
      roleKey: undefined as any,
      isActive: false,
      branchIds: [],
      activeBranchId: null,
      sessionId: '',
      ipAddress: req.ip,
    };

    // Attach to request so AuthGuard can mutate it
    (req as any).__requestContext = ctx;

    RequestContext.run(ctx, () => {
      next();
    });
  }
}

