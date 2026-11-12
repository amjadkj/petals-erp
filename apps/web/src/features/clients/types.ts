import { ClientDto, ClientStatus } from '@petals/types';

export interface ClientRowItem extends ClientDto {
  departmentName?: string;
  therapistName?: string;
  scheduledCount?: number;
  attendedCount?: number;
}

export interface ClientFiltersState {
  search: string;
  departmentId: string;
  therapistId: string;
  status: string; // 'ALL' | 'ACTIVE' | 'ON_HOLD' | 'DISCHARGED'
  tab: 'all' | 'recent' | 'archived';
  page: number;
  pageSize: number;
}

export const INITIAL_CLIENT_FILTERS: ClientFiltersState = {
  search: '',
  departmentId: 'ALL',
  therapistId: 'ALL',
  status: 'ALL',
  tab: 'all',
  page: 1,
  pageSize: 10,
};
