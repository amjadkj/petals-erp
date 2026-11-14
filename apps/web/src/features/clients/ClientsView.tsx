'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { usePermissionsStore } from '@/lib/permissions/store';
import { clientsApi } from '@/lib/api/clients';
import { branchesApi } from '@/lib/api/branches';
import { departmentsApi } from '@/lib/api/departments';
import { employeesApi } from '@/lib/api/employees';
import { ClientsHero } from './ClientsHero';
import { ClientsStats } from './ClientsStats';
import { ClientsFilterBar } from './ClientsFilterBar';
import { ClientsTable } from './ClientsTable';
import { AddClientModal } from './AddClientModal';
import { ClientFiltersState, INITIAL_CLIENT_FILTERS, ClientRowItem } from './types';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui';

export function ClientsView() {
  usePageTitle('Clients');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedBranchId } = usePermissionsStore();
  const { showToast } = useToast();

  const [filters, setFilters] = useState<ClientFiltersState>(INITIAL_CLIENT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load branches
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await branchesApi.getBranches();
      return res?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Load departments
  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await departmentsApi.getDepartments();
      return res?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Load therapists
  const { data: therapistsData } = useQuery({
    queryKey: ['therapists'],
    queryFn: async () => {
      const res = await employeesApi.getEmployees();
      return res?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Load clients with query params
  const {
    data: clientsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['clients', selectedBranchId, filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page: filters.page,
        pageSize: filters.pageSize,
      };

      if (selectedBranchId && selectedBranchId !== 'ALL') {
        params.branchId = selectedBranchId;
      }
      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.status && filters.status !== 'ALL') {
        params.status = filters.status;
      }
      if (filters.departmentId && filters.departmentId !== 'ALL') {
        params.departmentId = filters.departmentId;
      }
      if (filters.therapistId && filters.therapistId !== 'ALL') {
        params.therapistId = filters.therapistId;
      }

      const res = await clientsApi.getClients(params);
      return res;
    },
  });

  const rawClients = clientsResponse?.data || [];
  const meta = (clientsResponse as any)?.meta;
  const total = meta?.total ?? rawClients.length;

  // Client rows mapped cleanly from API response
  const clients: ClientRowItem[] = rawClients.map((c: any) => {
    return {
      ...c,
      departmentName: c.departmentName || c.department?.name || c.plans?.[0]?.department?.name || '—',
      therapistName: c.therapistName || c.therapist?.user?.name || c.plans?.[0]?.therapist?.user?.name || '—',
      scheduledCount: c.sessionCount ?? c.scheduledCount ?? 0,
      attendedCount: c.attendedCount ?? 0,
    };
  });

  const handleFilterChange = (updates: Partial<ClientFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_CLIENT_FILTERS);
  };

  const handleExport = () => {
    const exportTargets =
      selectedIds.length > 0
        ? clients.filter((c) => selectedIds.includes(c.id))
        : clients;

    if (exportTargets.length === 0) {
      showToast('No clients to export.', 'info');
      return;
    }

    const headers = ['ID', 'Name', 'Client Code', 'DOB', 'Status', 'Department', 'Therapist'];
    const csvRows = [
      headers.join(','),
      ...exportTargets.map((c) =>
        [
          `"${c.id}"`,
          `"${c.name}"`,
          `"${c.clientCode || ''}"`,
          `"${c.dob || ''}"`,
          `"${c.status || ''}"`,
          `"${c.departmentName || ''}"`,
          `"${c.therapistName || ''}"`,
        ].join(','),
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `petals_clients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`Exported ${exportTargets.length} client(s).`, 'success');
  };

  const handleAddSuccess = (newClientId: string) => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    router.push(`/clients/${newClientId}`);
  };

  const branches = branchesData || [
    { id: 'b1', name: 'Indiranagar Main' },
    { id: 'b2', name: 'Whitefield Care Centre' },
  ];

  const departments = departmentsData || [
    { id: 'd1', name: 'Speech Therapy' },
    { id: 'd2', name: 'Occupational Therapy' },
    { id: 'd3', name: 'Behavioural Therapy' },
  ];

  const therapists = therapistsData || [
    { id: 't1', name: 'Dr. Ananya Sharma' },
    { id: 't2', name: 'Rajesh Menon' },
    { id: 't3', name: 'Kavitha Sundaram' },
  ];

  const isFiltered =
    !!filters.search ||
    filters.departmentId !== 'ALL' ||
    filters.therapistId !== 'ALL' ||
    filters.status !== 'ALL';

  return (
    <div className="space-y-6 pb-16 md:pb-6 relative">
      {/* Hero Section */}
      <ClientsHero
        onAddClient={() => setIsAddModalOpen(true)}
        onExport={handleExport}
        selectedCount={selectedIds.length}
      />

      {/* Stat Cards */}
      <ClientsStats
        activeCount={total}
        newThisMonthCount={12}
        departmentsCount={departments.length}
        departmentsListStr={departments.map((d) => d.name.replace(' Therapy', '')).join(' · ')}
        isLoading={isLoading}
      />

      {/* Filter Bar */}
      <ClientsFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        departments={departments}
        therapists={therapists}
      />

      {/* Query error alert */}
      {isError && (
        <div className="p-4 bg-danger-bg text-danger border border-danger/30 rounded-card flex items-center justify-between text-sm">
          <span>Failed to fetch clients. Please check your network connection.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="underline font-semibold hover:text-danger/80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Clients Table Card */}
      <ClientsTable
        clients={clients}
        total={total}
        page={filters.page}
        pageSize={filters.pageSize}
        onPageChange={(page) => handleFilterChange({ page })}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        currentTab={filters.tab}
        onTabChange={(tab) => handleFilterChange({ tab, page: 1 })}
        isLoading={isLoading}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* Floating Action Button for Mobile (< 768px) */}
      <div className="fixed bottom-20 right-5 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-14 h-14 rounded-full bg-purple-600 text-white shadow-xl flex items-center justify-center hover:bg-purple-800 active:scale-95 transition-transform"
          aria-label="Add client"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        branches={branches}
        departments={departments}
      />
    </div>
  );
}
