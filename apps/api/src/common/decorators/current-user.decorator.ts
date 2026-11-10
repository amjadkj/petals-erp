import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestContext, IRequestContext } from '../context/request-context';

/**
 * Parameter decorator that extracts the current user from the request context.
 * Usage: @CurrentUser() user: IRequestContext
 * Usage: @CurrentUser('userId') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof IRequestContext | undefined, _ctx: ExecutionContext) => {
    const requestCtx = RequestContext.current();
    if (!requestCtx) {
      return undefined;
    }
    return data ? requestCtx[data] : requestCtx;
  },
);

