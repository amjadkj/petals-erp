'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { usePermissionsStore } from '@/lib/permissions/store';
import { schedulesApi } from '@/lib/api/schedules';
import { clientsApi } from '@/lib/api/clients';
import { SchedulePlanningHero } from './SchedulePlanningHero';
import { SchedulePlanningStats } from './SchedulePlanningStats';
import { SchedulesTableTab } from './tabs/SchedulesTableTab';
import { AvailabilityGridTab } from './tabs/AvailabilityGridTab';
import { NeedsAttentionTab } from './tabs/NeedsAttentionTab';
import { NewScheduleModal } from './NewScheduleModal';
import { Tabs, TabList, TabTrigger } from '@/components/ui';
import { SchedulePlanningTabId, RecurringScheduleRow } from './types';

export function SchedulePlanningView() {
  usePageTitle('Schedule planning');
  const queryClient = useQueryClient();
  const { selectedBranchId } = usePermissionsStore();

  const [activeTab, setActiveTab] = useState<SchedulePlanningTabId>('schedules');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Load schedules
  const {
    data: schedulesData,
    isLoading: isSchedulesLoading,
    refetch: refetchSchedules,
  } = useQuery({
    queryKey: ['schedules', selectedBranchId],
    queryFn: async () => {
      try {
        const res = await schedulesApi.getSchedules();
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Load clients for schedule modal
  const { data: clientsData } = useQuery({
    queryKey: ['schedule-clients'],
    queryFn: async () => {
      const res = await clientsApi.getClients({ page: 1, pageSize: 100 });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Sample recurring schedules if none returned
  const defaultSchedules: RecurringScheduleRow[] = [
    {
      id: 'sc1',
      clientId: 'c1',
      clientName: 'Aadhya Nair',
      clientCode: 'PN-001',
      departmentName: 'Speech Therapy',
      therapistName: 'Dr. Ananya Sharma',
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE',
      ruleInWords: 'Mon, Wed · 10:00 am',
      startTime: '10:00',
      durationMinutes: 45,
      startsOn: '01 Nov 2026',
      status: 'ACTIVE',
      sessionsGenerated: 16,
    },
    {
      id: 'sc2',
      clientId: 'c2',
      clientName: 'Vihaan Sharma',
      clientCode: 'PN-004',
      departmentName: 'Occupational Therapy',
      therapistName: 'Rajesh Menon',
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU,TH',
      ruleInWords: 'Tue, Thu · 11:15 am',
      startTime: '11:15',
      durationMinutes: 45,
      startsOn: '15 Oct 2026',
      status: 'ACTIVE',
      sessionsGenerated: 16,
    },
    {
      id: 'sc3',
      clientId: 'c3',
      clientName: 'Arjun Das',
      clientCode: 'PN-012',
      departmentName: 'Behavioural Therapy',
      therapistName: 'Kavitha Sundaram',
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
      ruleInWords: 'Mon, Wed, Fri · 02:00 pm',
      startTime: '14:00',
      durationMinutes: 45,
      startsOn: '20 Oct 2026',
      status: 'PAUSED',
      sessionsGenerated: 24,
    },
  ];

  const schedules: RecurringScheduleRow[] =
    schedulesData && schedulesData.length > 0
      ? (schedulesData as any)
      : defaultSchedules;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['schedules'] });
    refetchSchedules();
  };

  const clientList = clientsData || [
    { id: 'c1', name: 'Aadhya Nair', clientCode: 'PN-001' },
    { id: 'c2', name: 'Vihaan Sharma', clientCode: 'PN-004' },
    { id: 'c3', name: 'Arjun Das', clientCode: 'PN-012' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Hero */}
      <SchedulePlanningHero onNewSchedule={() => setIsNewModalOpen(true)} />

      {/* Stats Cards */}
      <SchedulePlanningStats
        activeSchedulesCount={schedules.filter((s) => s.status === 'ACTIVE').length}
        sessionsThisWeekCount={48}
        conflictsCount={0}
        affectedByLeaveCount={3}
        isLoading={isSchedulesLoading}
      />

      {/* Main Tabs Navigation */}
      <div className="bg-white border-b border-[#E6D8F1]/60 px-5 pt-1 rounded-t-card overflow-x-auto">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as SchedulePlanningTabId)}>
          <TabList className="gap-6 border-b-0">
            <TabTrigger value="schedules">Recurring Schedules</TabTrigger>
            <TabTrigger value="availability">Therapist Availability Grid</TabTrigger>
            <TabTrigger value="attention">Needs Attention (3)</TabTrigger>
          </TabList>
        </Tabs>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'schedules' && (
          <SchedulesTableTab schedules={schedules} onRefresh={handleRefresh} />
        )}

        {activeTab === 'availability' && <AvailabilityGridTab />}

        {activeTab === 'attention' && <NeedsAttentionTab onRefresh={handleRefresh} />}
      </div>

      {/* New Schedule Modal */}
      <NewScheduleModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={handleRefresh}
        clients={clientList}
        treatmentPlans={[
          {
            id: 'tp1',
            clientId: 'c1',
            departmentName: 'Speech Therapy',
            therapistName: 'Dr. Ananya Sharma',
            durationMinutes: 45,
          },
          {
            id: 'tp2',
            clientId: 'c2',
            departmentName: 'Occupational Therapy',
            therapistName: 'Rajesh Menon',
            durationMinutes: 45,
          },
          {
            id: 'tp3',
            clientId: 'c3',
            departmentName: 'Behavioural Therapy',
            therapistName: 'Kavitha Sundaram',
            durationMinutes: 45,
          },
        ]}
      />
    </div>
  );
}
