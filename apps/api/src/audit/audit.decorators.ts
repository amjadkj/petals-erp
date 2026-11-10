import { SetMetadata } from '@nestjs/common';

export const AUDIT_SENSITIVE_READ_KEY = 'audit:sensitive_read';
export const AUDIT_IGNORE_KEY = 'audit:ignore';
export const AUDIT_ENTITY_KEY = 'audit:entity';
export const AUDIT_ACTION_KEY = 'audit:action';

/**
 * Decorator to mark a GET endpoint as a sensitive clinical read that must be audited.
 */
export const AuditSensitiveRead = (entity?: string) => {
  return (target: any, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
    SetMetadata(AUDIT_SENSITIVE_READ_KEY, true)(target, key!, descriptor!);
    if (entity) {
      SetMetadata(AUDIT_ENTITY_KEY, entity)(target, key!, descriptor!);
    }
  };
};

/**
 * Decorator to exclude an endpoint or controller from being auto-audited by AuditInterceptor.
 */
export const AuditIgnore = () => SetMetadata(AUDIT_IGNORE_KEY, true);

/**
 * Explicitly sets the entity name for the audit log on this route.
 */
export const AuditEntity = (entity: string) => SetMetadata(AUDIT_ENTITY_KEY, entity);

/**
 * Explicitly sets the action name for the audit log on this route.
 */
export const AuditAction = (action: string) => SetMetadata(AUDIT_ACTION_KEY, action);

