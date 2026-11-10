import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestContext } from '../context/request-context';

/**
 * Parameter decorator that extracts the active branch ID from the request context.
 * Usage: @CurrentBranch() branchId: string
 */
export const CurrentBranch = createParamDecorator(
  (_data: unknown, _ctx: ExecutionContext) => {
    const requestCtx = RequestContext.current();
    return requestCtx?.activeBranchId ?? null;
  },
);

