import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response } from 'express';

/**
 * Interceptor that ensures patient and clinical data responses are never cached by intermediaries or browsers.
 * Sets `Cache-Control: no-store, no-cache, must-revalidate` and `Pragma: no-cache`.
 */
@Injectable()
export class NoStoreInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const response = context.switchToHttp().getResponse<Response>();
      response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.setHeader('Pragma', 'no-cache');
    }
    return next.handle();
  }
}
