import type { AuditLogDto } from '@/lib/api/access';

export interface AuditLogFilterState {
  userId: string;
  entity: string;
  branchId: string;
  startDate: string;
  endDate: string;
  search: string;
}

export type { AuditLogDto };

