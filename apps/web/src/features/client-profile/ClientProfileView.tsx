'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { clientsApi, ClientProfileHeader } from '@/lib/api/clients';
import { branchesApi } from '@/lib/api/branches';
import { departmentsApi } from '@/lib/api/departments';
import { employeesApi } from '@/lib/api/employees';
import { ProfileHeader } from './ProfileHeader';
import { OverviewTab } from './tabs/OverviewTab';
import { Tabs, TabList, TabTrigger } from '@/components/ui';
import { ProfileTabId, ALL_PROFILE_TABS } from './types';
import { RoleKey } from '@petals/types';

// Dynamically import non-default tabs to slash initial chunk weight
const AssessmentsTab = dynamic(
  () => import('./tabs/AssessmentsTab').then((m) => m.AssessmentsTab),
  {
    loading: () => <div className="h-48 bg-white rounded-card animate-pulse" />,
    ssr: false,
  },
);

const TreatmentPlansTab = dynamic(
  () => import('./tabs/TreatmentPlansTab').then((m) => m.TreatmentPlansTab),
  {
    loading: () => <div className="h-48 bg-white rounded-card animate-pulse" />,
    ssr: false,
  },
);

const ProgressTab = dynamic(
  () => import('./tabs/ProgressTab').then((m) => m.ProgressTab),
  {
    loading: () => <div className="h-48 bg-white rounded-card animate-pulse" />,
    ssr: false,
  },
);

const ReportsTab = dynamic(
  () => import('./tabs/ReportsTab').then((m) => m.ReportsTab),
  {
    loading: () => <div className="h-48 bg-white rounded-card animate-pulse" />,
    ssr: false,
  },
);

const DocumentsTab = dynamic(
  () => import('./tabs/DocumentsTab').then((m) => m.DocumentsTab),
  {
    loading: () => <div className="h-48 bg-white rounded-card animate-pulse" />,
    ssr: false,
  },
);

const SessionsTab = dynamic(
  () => import('./tabs/SessionsTab').then((m) => m.SessionsTab),
  {
    loading: () => <div className="h-48 bg-white rounded-card animate-pulse" />,
    ssr: false,
  },
);

const EditClientModal = dynamic(
  () => import('./EditClientModal').then((m) => m.EditClientModal),
  { ssr: false },
);

export function ClientProfileView() {
  usePageTitle('Clients');
  const params = useParams();
  const clientId = (params?.id as string) || '';
  const queryClient = useQueryClient();
  const { myRole } = usePermissions();
  const role = myRole || RoleKey.DIRECTOR;

  const [activeTab, setActiveTab] = useState<ProfileTabId>('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Fetch client header
  const {
    data: clientResponse,
    isLoading: isClientLoading,
    isError: isClientError,
    refetch: refetchClient,
  } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const res = await clientsApi.getClientProfile(clientId);
      return res?.data ?? null;
    },
    enabled: !!clientId,
  });

  // Fetch client overview
  const { data: overviewData } = useQuery({
    queryKey: ['client-overview', clientId],
    queryFn: async () => {
      const res = await clientsApi.getClientOverview(clientId);
      return res?.data ?? null;
    },
    enabled: !!clientId,
  });

  // Fetch branches
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await branchesApi.getBranches();
      return res?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch departments
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await departmentsApi.getDepartments();
      return res?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch therapists
  const { data: therapists } = useQuery({
    queryKey: ['therapists'],
    queryFn: async () => {
      const res = await employeesApi.getEmployees();
      return res?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch assessments (lazy: only when activeTab === 'assessments')
  const { data: assessments, refetch: refetchAssessments } = useQuery({
    queryKey: ['client-assessments', clientId],
    queryFn: async () => {
      const res = await clientsApi.getAssessments(clientId);
      return res?.data ?? [];
    },
    enabled: !!clientId && activeTab === 'assessments',
  });

  // Fetch treatment plans (lazy: only when activeTab === 'treatment-plans')
  const { data: treatmentPlans, refetch: refetchPlans } = useQuery({
    queryKey: ['client-treatment-plans', clientId],
    queryFn: async () => {
      const res = await clientsApi.getTreatmentPlans(clientId);
      return res?.data ?? [];
    },
    enabled: !!clientId && activeTab === 'treatment-plans',
  });

  // Fetch goals (lazy: only when activeTab === 'progress')
  const { data: goals, refetch: refetchGoals } = useQuery({
    queryKey: ['client-goals', clientId],
    queryFn: async () => {
      const res = await clientsApi.getGoals(clientId);
      return res?.data ?? [];
    },
    enabled: !!clientId && activeTab === 'progress',
  });

  const branchName =
    branches?.find((b) => b.id === clientResponse?.branchId)?.name ||
    'Clinic Facility';

  // Determine allowed tabs
  const allowedTabIds: ProfileTabId[] = React.useMemo(() => {
    if (role === RoleKey.PARENT) {
      return ['overview', 'treatment-plans', 'assessments', 'reports'];
    }
    return ALL_PROFILE_TABS.map((t) => t.id);
  }, [role]);

  const visibleTabs = ALL_PROFILE_TABS.filter((t) => allowedTabIds.includes(t.id));

  if (isClientLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="h-40 bg-white border border-[#E6D8F1]/40 rounded-card p-6" />
        <div className="h-10 bg-purple-50 rounded" />
        <div className="h-64 bg-white border border-[#E6D8F1]/40 rounded-card" />
      </div>
    );
  }

  if (!clientResponse) {
    return (
      <div className="bg-white rounded-card border border-[#E6D8F1]/60 p-12 text-center space-y-3 shadow-sm">
        <h2 className="font-quicksand font-bold text-lg text-ink">Client Record Not Found</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          The requested client record could not be found or you do not have permission to view it.
        </p>
        <Link
          href="/clients"
          className="inline-block text-xs font-semibold text-purple-600 hover:underline pt-2"
        >
          ← Return to Clients List
        </Link>
      </div>
    );
  }

  const client: ClientProfileHeader = clientResponse;

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['client', clientId] });
    refetchClient();
    refetchAssessments();
    refetchPlans();
    refetchGoals();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Profile Summary */}
      <ProfileHeader
        client={client}
        branchName={branchName}
        onEdit={() => setIsEditOpen(true)}
      />

      {isClientError && (
        <div className="p-3.5 bg-danger-bg text-danger border border-danger/30 rounded-card text-xs md:text-sm">
          Notice: Operating with client profile snapshot. Live sync active.
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-[#E6D8F1]/60 px-5 pt-1 rounded-t-card overflow-x-auto shadow-xs">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as ProfileTabId)}>
          <TabList className="gap-6 border-b-0">
            {visibleTabs.map((tab) => (
              <TabTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabTrigger>
            ))}
          </TabList>
        </Tabs>
      </div>

      {/* Active Tab Surface (Only renders the active tab) */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab
            clientId={clientId}
            data={overviewData as any}
            role={role}
            onRefresh={handleRefreshAll}
          />
        )}

        {activeTab === 'assessments' && (
          <AssessmentsTab
            clientId={clientId}
            assessments={assessments || []}
            role={role}
            onRefresh={handleRefreshAll}
          />
        )}

        {activeTab === 'treatment-plans' && (
          <TreatmentPlansTab
            clientId={clientId}
            plans={treatmentPlans || []}
            role={role}
            onRefresh={handleRefreshAll}
            departments={departments || []}
            therapists={therapists?.map((t) => ({ id: t.id, name: t.name })) || []}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTab
            clientId={clientId}
            goals={goals || []}
            role={role}
            onRefresh={handleRefreshAll}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            clientId={clientId}
            reports={[]}
            role={role}
            onRefresh={handleRefreshAll}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsTab clientId={clientId} role={role} />
        )}

        {activeTab === 'sessions' && (
          <SessionsTab clientId={clientId} />
        )}
      </div>

      {/* Edit Client Modal */}
      {isEditOpen && (
        <EditClientModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          client={client}
          onSuccess={handleRefreshAll}
        />
      )}
    </div>
  );
}
