import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestContext, IRequestContext } from '../context/request-context';

/**
 * Parameter decorator that extracts the current user from the request context.
 * Usage: @CurrentUser() user: IRequestContext
 * Usage: @CurrentUser('userId') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof IRequestContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const requestCtx =
      (RequestContext.current()?.userId ? RequestContext.current() : null) ||
      request?.user ||
      request?.__requestContext;
    if (!requestCtx || !requestCtx.userId) {
      return undefined;
    }
    return data ? requestCtx[data] : requestCtx;
  },
);

