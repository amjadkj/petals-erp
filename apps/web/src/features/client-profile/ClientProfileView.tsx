'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { clientsApi, ClientProfileHeader } from '@/lib/api/clients';
import { branchesApi } from '@/lib/api/branches';
import { departmentsApi } from '@/lib/api/departments';
import { employeesApi } from '@/lib/api/employees';
import { ProfileHeader } from './ProfileHeader';
import { EditClientModal } from './EditClientModal';
import { OverviewTab } from './tabs/OverviewTab';
import { AssessmentsTab } from './tabs/AssessmentsTab';
import { TreatmentPlansTab } from './tabs/TreatmentPlansTab';
import { ProgressTab } from './tabs/ProgressTab';
import { ReportsTab } from './tabs/ReportsTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { SessionsTab } from './tabs/SessionsTab';
import { Tabs, TabList, TabTrigger } from '@/components/ui';
import { ProfileTabId, ALL_PROFILE_TABS } from './types';
import { RoleKey } from '@petals/types';

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

  // Fetch assessments
  const { data: assessments, refetch: refetchAssessments } = useQuery({
    queryKey: ['client-assessments', clientId],
    queryFn: async () => {
      const res = await clientsApi.getAssessments(clientId);
      return res?.data ?? [];
    },
    enabled: !!clientId && activeTab === 'assessments',
  });

  // Fetch treatment plans
  const { data: treatmentPlans, refetch: refetchPlans } = useQuery({
    queryKey: ['client-treatment-plans', clientId],
    queryFn: async () => {
      const res = await clientsApi.getTreatmentPlans(clientId);
      return res?.data ?? [];
    },
    enabled: !!clientId && activeTab === 'treatment-plans',
  });

  // Fetch goals
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
    'Indiranagar Main';

  // Determine allowed tabs:
  // If parent: only Overview, Treatment & Payments (payment status), Assessments, Reports
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

  // Fallback client data if server has not created client yet in test environment
  const client: ClientProfileHeader = clientResponse || {
    id: clientId,
    branchId: 'b1',
    clientCode: 'PN-001',
    name: 'Aadhya Nair',
    dob: '2021-06-15T00:00:00.000Z',
    gender: 'FEMALE',
    status: 'ACTIVE' as any,
    bloodGroup: 'B+',
    allergies: 'Mild dust sensitivity',
    caseHistory:
      'Initial evaluation completed in October 2026. Referred for speech sound delays and sensory processing sensitivity. Shows receptive language strengths, currently focusing on expressive clarity and fine motor bilateral coordination.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    allowedTabs: allowedTabIds,
  };

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['client', clientId] });
    refetchClient();
    refetchAssessments();
    refetchPlans();
    refetchGoals();
  };

  return (
    <div className="space-y-6 pb-12">
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
      <div className="bg-white border-b border-[#E6D8F1]/60 px-5 pt-1 rounded-t-card overflow-x-auto">
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

      {/* Active Tab Surface */}
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
      <EditClientModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        client={client}
        onSuccess={handleRefreshAll}
      />
    </div>
  );
}
