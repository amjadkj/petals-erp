import { useQuery } from '@tanstack/react-query';
import { branchesApi } from '@/lib/api/branches';
import { departmentsApi } from '@/lib/api/departments';
import type { BranchDto, DepartmentDto } from '@petals/types';

/**
 * Shared hook to load branches once and cache for 30 minutes in TanStack Query.
 */
export function useBranches() {
  const query = useQuery<BranchDto[]>({
    queryKey: ['master-branches'],
    queryFn: async () => {
      const res = await branchesApi.getBranches();
      return res?.data ?? [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour in cache
  });

  return {
    branches: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * Shared hook to load departments once and cache for 30 minutes in TanStack Query.
 */
export function useDepartments() {
  const query = useQuery<DepartmentDto[]>({
    queryKey: ['master-departments'],
    queryFn: async () => {
      const res = await departmentsApi.getDepartments();
      return res?.data ?? [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour in cache
  });

  return {
    departments: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
