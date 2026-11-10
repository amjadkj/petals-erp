import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestContext } from '../context/request-context';

/**
 * Parameter decorator that extracts the active branch ID from the request context.
 * Usage: @CurrentBranch() branchId: string
 */
export const CurrentBranch = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const requestCtx =
      (RequestContext.current()?.userId ? RequestContext.current() : null) ||
      request?.user ||
      request?.__requestContext;
    return requestCtx?.activeBranchId ?? null;
  },
);

