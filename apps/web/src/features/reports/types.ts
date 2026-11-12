import type { ReportStatus, ReportType } from '@petals/types';
import type { ReportItemDto } from '@/lib/api/reports';

export type { ReportStatus, ReportType };

export type ReportsTab = 'all' | 'due' | 'drafts' | 'submitted' | 'shared';

export interface ReportsFilterState {
  search: string;
  therapistId: string;
  type: string;
  status: string;
  overdueOnly: boolean;
}

export interface NewReportFormValues {
  clientId: string;
  title: string;
  type: ReportType;
  dueOn: string;
}

export type { ReportItemDto };

