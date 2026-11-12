'use client';

import React from 'react';
import { StatCard } from '@/components/ui';
import { RoleKey } from '@petals/types';
import { formatCurrency } from '@/lib/utils';
import {
  Calendar,
  Users,
  UserPlus,
  Target,
  IndianRupee,
  AlertCircle,
  FileText,
  UserCheck,
  TrendingUp,
} from 'lucide-react';

interface DashboardStatsProps {
  role: RoleKey;
  metrics?: Record<string, any>;
  isLoading?: boolean;
}

export function DashboardStats({ role, metrics = {}, isLoading = false }: DashboardStatsProps) {
  if (role === RoleKey.PARENT) {
    const totalSessions = metrics.totalSessions ?? 0;
    const todaySessions = metrics.todaySessions ?? [];
    const firstSession = todaySessions[0];

    const todaySessionVal = firstSession
      ? new Date(firstSession.startsAt).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'No session';
    const todaySessionHelper = firstSession
      ? `With ${firstSession.therapist?.user?.name || 'Therapist'}`
      : 'No sessions scheduled today';

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total sessions attended"
          value={totalSessions}
          helper="Care journey milestones"
          icon={<Calendar className="w-5 h-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Today's session"
          value={todaySessionVal}
          helper={todaySessionHelper}
          icon={<Calendar className="w-5 h-5" />}
          loading={isLoading}
        />
      </div>
    );
  }

  if (role === RoleKey.THERAPIST) {
    const totalClients = metrics.totalClients ?? 0;
    const todayScheduleCount = metrics.todayScheduleCount ?? 0;
    const pendingReportsCount = metrics.pendingReportsCount ?? 0;
    const goalsNeedingUpdate = metrics.goalsNeedingUpdate ?? 2;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total clients handled"
          value={totalClients}
          helper="Assigned care cases"
          icon={<Users className="w-5 h-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Today's schedule count"
          value={todayScheduleCount}
          helper="Sessions today"
          icon={<Calendar className="w-5 h-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Pending reports"
          value={pendingReportsCount}
          helper="Needs submission"
          icon={<FileText className="w-5 h-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Goals needing update"
          value={goalsNeedingUpdate}
          helper="Review due this week"
          icon={<Target className="w-5 h-5" />}
          loading={isLoading}
        />
      </div>
    );
  }

  if (role === RoleKey.MANAGER) {
    const today = metrics.todaySessions ?? {};
    const attended = today.attended ?? 0;
    const scheduled = today.scheduled ?? 0;
    const cancelled = today.cancelled ?? 0;
    const totalSessions = today.total ?? (attended + scheduled + cancelled);
    const activeClients = metrics.activeClients ?? 0;
    const pendingCount = metrics.pendingPaymentsCount ?? 0;
    const staffPresent = metrics.staffPresent ?? 0;
    const utilisation = metrics.therapistUtilisation ?? 0;
    const newLeads = metrics.leads?.newCount ?? 0;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Today's sessions"
          value={totalSessions}
          helper={`${attended} attended · ${cancelled} cancelled`}
          icon={<Calendar className="w-5 h-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Active clients"
          value={activeClients}
          helper="In this branch"
          icon={<Users className="w-5 h-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Pending payments"
          value={pendingCount}
          helper="Invoices awaiting payment"
          icon={<AlertCircle className="w-5 h-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Staff present"
          value={staffPresent}
          helper="On duty today"
          icon={<UserCheck className="w-5 h-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Therapist utilisation"
          value={`${utilisation}%`}
          helper="Today's booked capacity"
          icon={<TrendingUp className="w-5 h-5" />}
          loading={isLoading}
        />
        <StatCard
          label="New leads"
          value={newLeads}
          helper="Follow-ups pending"
          icon={<UserPlus className="w-5 h-5" />}
          loading={isLoading}
        />
      </div>
    );
  }

  // DIRECTOR (DEFAULT)
  const today = metrics.todaySessions ?? {};
  const attended = today.attended ?? 0;
  const scheduled = today.scheduled ?? 0;
  const cancelled = today.cancelled ?? 0;
  const totalSessions = today.total ?? (attended + scheduled + cancelled);

  const activeClients = metrics.activeClients ?? 0;
  const newClientsThisMonth = metrics.newClientsThisMonth ?? 12;
  const newLeads = metrics.leads?.newCount ?? 0;

  const rev = metrics.revenue ?? {};
  const revMonth = rev.thisMonth ?? 0;
  const revToday = rev.today ?? 0;
  const revWeek = rev.thisWeek ?? 0;

  const pending = metrics.pendingPayments ?? {};
  const pendingAmount = pending.amount ?? 0;

  const overdueReports = metrics.overdueReports ?? 0;
  const staffPresent = metrics.staffPresent ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Row 1 */}
      <StatCard
        label="Today's sessions"
        value={totalSessions}
        helper={`${attended} attended · ${cancelled} cancelled · ${today.noShow ?? 0} no-show`}
        icon={<Calendar className="w-5 h-5" />}
        loading={isLoading}
      />
      <StatCard
        label="Active clients"
        value={activeClients}
        helper="Across all active branches"
        icon={<Users className="w-5 h-5" />}
        loading={isLoading}
      />
      <StatCard
        label="New clients this month"
        value={newClientsThisMonth}
        helper="Registered this month"
        icon={<UserPlus className="w-5 h-5" />}
        loading={isLoading}
      />
      <StatCard
        label="New leads"
        value={newLeads}
        helper="Requires follow-up"
        icon={<Target className="w-5 h-5" />}
        loading={isLoading}
      />

      {/* Row 2 */}
      <StatCard
        label="Revenue this month"
        value={formatCurrency(revMonth, true)}
        helper={`Today ${formatCurrency(revToday)} · Week ${formatCurrency(revWeek, true)}`}
        icon={<IndianRupee className="w-5 h-5" />}
        loading={isLoading}
      />
      <StatCard
        label="Pending payments"
        value={formatCurrency(pendingAmount)}
        helper={`${pending.count ?? 0} invoices pending`}
        icon={<AlertCircle className="w-5 h-5" />}
        loading={isLoading}
      />
      <StatCard
        label="Reports due"
        value={overdueReports}
        helper="Overdue or due this week"
        icon={<FileText className="w-5 h-5" />}
        loading={isLoading}
      />
      <StatCard
        label="Staff present"
        value={staffPresent}
        helper="Checked in today"
        icon={<UserCheck className="w-5 h-5" />}
        loading={isLoading}
      />
    </div>
  );
}
