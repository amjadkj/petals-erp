'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { Tabs, TabList, TabTrigger } from '@/components/ui';
import { RoleKey, ReportStatus } from '@petals/types';
import {
  ReportsHero,
  ReportsStatCards,
  ReportsFilterBar,
  ReportsTable,
  NewReportModal,
} from '@/features/reports';
import type { ReportItemDto, ReportsFilterState, ReportsTab } from '@/features/reports';
import { reportsApi } from '@/lib/api/reports';
import { clientsApi } from '@/lib/api/clients';
import { branchesApi } from '@/lib/api/branches';
import type { ClientDto, UserSummary } from '@petals/types';
import { isThisWeek } from 'date-fns';

export default function ReportsPage() {
  usePageTitle('Reports');
  const { myRole } = usePermissions();

  const [activeTab, setActiveTab] = useState<ReportsTab>('all');
  const [reports, setReports] = useState<ReportItemDto[]>([]);
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOverdue, setIsCheckingOverdue] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [filters, setFilters] = useState<ReportsFilterState>({
    search: '',
    therapistId: '',
    type: '',
    status: '',
    overdueOnly: false,
  });

  const isTherapist = myRole === RoleKey.THERAPIST;
  const isParent = myRole === RoleKey.PARENT;

  // Fetch reports data
  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await reportsApi.getReportsDue();
      setReports(res.data ?? []);
    } catch {
      // Fallback empty list
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch support entities (clients & therapists for modals and filters)
  useEffect(() => {
    loadReports();

    // Load clients
    clientsApi
      .getClients({ pageSize: '100' })
      .then((res) => {
        if (res && res.data) setClients(res.data);
      })
      .catch(() => {});

    // Load users
    branchesApi
      .getUsers()
      .then((res) => {
        if (res && res.data) setUsers(res.data);
      })
      .catch(() => {});
  }, [loadReports]);

  // Check Overdue Action
  const handleCheckOverdue = async () => {
    try {
      setIsCheckingOverdue(true);
      setToastMessage(null);
      const res = await reportsApi.checkOverdue();
      setToastMessage({
        type: 'success',
        text: `Overdue check complete. ${res.data?.overdueCount ?? 0} overdue report(s) found, ${res.data?.notificationsCreated ?? 0} reminder(s) generated.`,
      });
      loadReports();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to trigger overdue check';
      setToastMessage({ type: 'error', text: msg });
    } finally {
      setIsCheckingOverdue(false);
    }
  };

  // Row Send Reminder
  const handleSendReminder = async (report: ReportItemDto) => {
    try {
      await reportsApi.checkOverdue();
      setToastMessage({
        type: 'success',
        text: `Reminder dispatched to therapist for "${report.title}".`,
      });
    } catch {
      setToastMessage({
        type: 'error',
        text: 'Failed to send reminder to therapist.',
      });
    }
  };

  // Filter therapists
  const therapists = useMemo(() => {
    return users
      .filter((u) => u.roleKey === RoleKey.THERAPIST)
      .map((u) => ({ id: u.id, name: u.name }));
  }, [users]);

  // Compute stat metrics
  const now = new Date();
  const { totalDue, totalOverdue, dueThisWeek, totalShared, draftsCount, submittedCount } =
    useMemo(() => {
      let due = 0;
      let overdue = 0;
      let thisWeek = 0;
      let shared = 0;
      let drafts = 0;
      let submitted = 0;

      for (const r of reports) {
        const d = r.dueOn ? new Date(r.dueOn) : null;
        const isOver = Boolean(
          r.isOverdue || (d && d < now && r.status !== ReportStatus.SHARED),
        );

        if (r.status !== ReportStatus.SHARED) due++;
        if (isOver) overdue++;
        if (d && isThisWeek(d)) thisWeek++;
        if (r.status === ReportStatus.SHARED) shared++;
        if (r.status === ReportStatus.DRAFT) drafts++;
        if (r.status === ReportStatus.SUBMITTED) submitted++;
      }

      return {
        totalDue: due,
        totalOverdue: overdue,
        dueThisWeek: thisWeek,
        totalShared: shared,
        draftsCount: drafts,
        submittedCount: submitted,
      };
    }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Tab filter for therapist
      if (isTherapist) {
        if (activeTab === 'due' && r.status === ReportStatus.SHARED) return false;
        if (activeTab === 'drafts' && r.status !== ReportStatus.DRAFT) return false;
        if (activeTab === 'submitted' && r.status !== ReportStatus.SUBMITTED) return false;
      }

      // Parent only sees shared reports
      if (isParent && r.status !== ReportStatus.SHARED) {
        return false;
      }

      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const clientName = r.client?.name?.toLowerCase() ?? '';
        const clientCode = r.client?.clientCode?.toLowerCase() ?? '';
        const title = r.title.toLowerCase();
        if (!clientName.includes(q) && !clientCode.includes(q) && !title.includes(q)) {
          return false;
        }
      }

      // Type
      if (filters.type && r.type !== filters.type) {
        return false;
      }

      // Status
      if (filters.status && r.status !== filters.status) {
        return false;
      }

      // Therapist
      if (filters.therapistId && r.authorId !== filters.therapistId) {
        return false;
      }

      // Overdue
      if (filters.overdueOnly) {
        const d = r.dueOn ? new Date(r.dueOn) : null;
        const isOver = Boolean(
          r.isOverdue || (d && d < now && r.status !== ReportStatus.SHARED),
        );
        if (!isOver) return false;
      }

      return true;
    });
  }, [reports, isTherapist, isParent, activeTab, filters]);

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <ReportsHero
        roleKey={myRole}
        onNewReport={() => setNewModalOpen(true)}
        onCheckOverdue={handleCheckOverdue}
        isCheckingOverdue={isCheckingOverdue}
      />

      {/* Toast / Notification Banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-card text-sm font-medium flex items-center justify-between ${
            toastMessage.type === 'success'
              ? 'bg-success-bg text-success border border-[#1E6B3A]/20'
              : 'bg-danger-bg text-danger border border-[#B4414F]/20'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <ReportsStatCards
        roleKey={myRole}
        totalDue={totalDue}
        totalOverdue={totalOverdue}
        dueThisWeek={dueThisWeek}
        totalShared={totalShared}
        draftsCount={draftsCount}
        submittedCount={submittedCount}
        loading={isLoading}
      />

      {/* Therapist specific tabs */}
      {isTherapist && (
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card px-4 pt-2">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as ReportsTab)}
          >
            <TabList>
              <TabTrigger value="all">All Reports</TabTrigger>
              <TabTrigger value="due">Due ({totalDue})</TabTrigger>
              <TabTrigger value="drafts">Drafts ({draftsCount})</TabTrigger>
              <TabTrigger value="submitted">Submitted ({submittedCount})</TabTrigger>
            </TabList>
          </Tabs>
        </div>
      )}

      {/* Filters Bar */}
      <ReportsFilterBar
        filters={filters}
        onChange={setFilters}
        roleKey={myRole}
        therapists={therapists}
      />

      {/* Reports Table / Mobile Cards */}
      <ReportsTable
        reports={filteredReports}
        roleKey={myRole}
        onSendReminder={handleSendReminder}
        isLoading={isLoading}
      />

      {/* New Report Modal */}
      <NewReportModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        clients={clients}
      />
    </div>
  );
}
