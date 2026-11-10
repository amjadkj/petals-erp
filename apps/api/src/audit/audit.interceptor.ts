import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from './audit.service';
import {
  AUDIT_ACTION_KEY,
  AUDIT_ENTITY_KEY,
  AUDIT_IGNORE_KEY,
  AUDIT_SENSITIVE_READ_KEY,
} from './audit.decorators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const controller = context.getClass();

    // Check if explicitly ignored
    const isIgnored = this.reflector.getAllAndOverride<boolean>(
      AUDIT_IGNORE_KEY,
      [handler, controller],
    );
    if (isIgnored) {
      return next.handle();
    }

    const method = req.method.toUpperCase();
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const isSensitiveRead = this.reflector.getAllAndOverride<boolean>(
      AUDIT_SENSITIVE_READ_KEY,
      [handler, controller],
    );

    // Only audit mutating actions or sensitive clinical reads
    if (!isMutating && !isSensitiveRead) {
      return next.handle();
    }

    const explicitEntity = this.reflector.getAllAndOverride<string>(
      AUDIT_ENTITY_KEY,
      [handler, controller],
    );
    const explicitAction = this.reflector.getAllAndOverride<string>(
      AUDIT_ACTION_KEY,
      [handler, controller],
    );

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress;

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          this.logAuditEvent({
            req,
            responseData,
            method,
            isSensitiveRead,
            explicitEntity,
            explicitAction,
            clientIp,
          });
        },
      }),
    );
  }

  private logAuditEvent(params: {
    req: Request;
    responseData: any;
    method: string;
    isSensitiveRead: boolean;
    explicitEntity?: string;
    explicitAction?: string;
    clientIp?: string;
  }) {
    const { req, responseData, method, isSensitiveRead, explicitEntity, explicitAction, clientIp } = params;

    // 1. Determine User ID
    const user = (req as any).user;
    const userId =
      user?.userId ||
      user?.id ||
      responseData?.user?.id ||
      (responseData?.id && req.path.includes('/auth/login') ? responseData.id : undefined);

    // 2. Determine Action
    let action = explicitAction;
    if (!action) {
      if (req.path.includes('/auth/login')) {
        action = 'LOGIN';
      } else if (req.path.includes('/auth/logout')) {
        action = 'LOGOUT';
      } else if (req.path.includes('/access/')) {
        action = 'PERMISSION_CHANGE';
      } else if (req.path.includes('/restore')) {
        action = 'RESTORE';
      } else if (isSensitiveRead) {
        action = 'READ_SENSITIVE';
      } else if (method === 'POST') {
        action = 'CREATE';
      } else if (method === 'PUT' || method === 'PATCH') {
        action = 'UPDATE';
      } else if (method === 'DELETE') {
        action = 'DELETE';
      } else {
        action = method;
      }
    }

    // 3. Determine Entity
    let entity = explicitEntity;
    if (!entity) {
      const pathSegments = req.path.replace(/^\/api\/v\d+\//, '').split('/');
      const baseSegment = pathSegments[0]?.toLowerCase();

      if (baseSegment === 'branches') {
        entity = 'Branch';
      } else if (baseSegment === 'users') {
        entity = 'User';
      } else if (baseSegment === 'employees') {
        entity = 'Employee';
      } else if (baseSegment === 'departments') {
        entity = 'Department';
      } else if (baseSegment === 'access') {
        entity = 'RolePermission';
      } else if (baseSegment === 'clinical' && pathSegments[1] === 'history') {
        entity = pathSegments[2] || 'ClinicalEntryVersion';
      } else if (baseSegment === 'audit-logs') {
        entity = 'AuditLog';
      } else if (baseSegment === 'auth') {
        entity = 'Auth';
      } else {
        entity = baseSegment ? baseSegment.charAt(0).toUpperCase() + baseSegment.slice(1) : 'System';
      }
    }

    // 4. Determine Entity ID
    const entityId =
      req.params?.id ||
      req.params?.entityId ||
      req.params?.userId ||
      responseData?.id ||
      responseData?.data?.id ||
      undefined;

    // 5. Determine Branch ID
    const branchId =
      (req as any).currentBranchId ||
      (req.headers['x-branch-id'] as string) ||
      req.body?.branchId ||
      responseData?.branchId ||
      responseData?.data?.branchId ||
      undefined;

    // 6. Build Metadata
    const metadata: Record<string, any> = {};
    if (req.body && Object.keys(req.body).length > 0) {
      metadata.body = req.body;
    }
    if (req.query && Object.keys(req.query).length > 0) {
      metadata.query = req.query;
    }
    if (req.params && Object.keys(req.params).length > 0) {
      metadata.params = req.params;
    }

    // Write audit log safely in background
    this.auditService
      .log({
        userId,
        action,
        entity,
        entityId: typeof entityId === 'string' ? entityId : undefined,
        branchId: typeof branchId === 'string' ? branchId : undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        ipAddress: clientIp,
      })
      .catch((err) => {
        this.logger.warn(`Failed in AuditInterceptor: ${(err as Error).message}`);
      });
  }
}

