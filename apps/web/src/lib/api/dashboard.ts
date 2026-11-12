import { fetcher } from './fetcher';
import type { ApiResponse, DashboardMetricsDto } from '@petals/types';

export const dashboardApi = {
  getDashboard: (branchId?: string) => {
    const qs = branchId && branchId !== 'ALL' ? `?branchId=${branchId}` : '';
    return fetcher<ApiResponse<DashboardMetricsDto>>(`/dashboard${qs}`, {}, { skipBranchId: !!branchId });
  },
};
