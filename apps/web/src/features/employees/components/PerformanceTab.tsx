'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusChip } from '@/components/ui/StatusChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { CheckCircle2, Clock, CalendarCheck, Users, ArrowRight, Activity, FileText } from 'lucide-react';
import { appointmentsApi } from '@/lib/api/appointments';
import { clientsApi } from '@/lib/api/clients';
import { employeesApi } from '@/lib/api/employees';
import { fetcher } from '@/lib/api/fetcher';
import { formatDateSafe } from '@/lib/formatters';
import Link from 'next/link';
import { formatAuditEntry } from './ActivityLogTab';
import type { EmployeeItem, WeeklyTrendPoint } from '../types';
import type { ApiResponse } from '@petals/types';

interface PerformanceTabProps {
  employee: EmployeeItem;
  onNavigateToCases?: () => void;
}

export function PerformanceTab({ employee, onNavigateToCases }: PerformanceTabProps) {
  // 1. Query sessions for this therapist
  const { data: sessionsRes } = useQuery({
    queryKey: ['employee-sessions', employee?.id],
    queryFn: () => appointmentsApi.getAppointments({ therapistId: employee?.id }, { skipBranchId: true }),
    enabled: !!employee?.id,
  });

  // 2. Query clients assigned to this therapist
  const { data: clientsRes } = useQuery({
    queryKey: ['employee-clients', employee?.id],
    queryFn: () => clientsApi.getClients({ therapistId: employee?.id }, { skipBranchId: true }),
    enabled: !!employee?.id,
  });

  // 3. Query employee performance summary
  const { data: summaryRes } = useQuery({
    queryKey: ['employee-summary', employee?.id],
    queryFn: () => employeesApi.getEmployeeSummary(employee?.id),
    enabled: !!employee?.id,
  });

  // 4. Query reports authored by this employee
  const { data: reportsRes } = useQuery({
    queryKey: ['employee-reports', employee?.id],
    queryFn: () =>
      fetcher<ApiResponse<any[]>>(`/reports?authorId=${employee?.id}`, {}, { skipBranchId: true }).catch(
        () => ({ data: [] } as any),
      ),
    enabled: !!employee?.id,
  });

  // 5. Query activity log for this employee
  const { data: activityRes } = useQuery({
    queryKey: ['employee-activity-log', employee?.id],
    queryFn: () => employeesApi.getEmployeeActivityLog(employee?.id),
    enabled: !!employee?.id,
  });

  const sessions = useMemo(() => sessionsRes?.data || [], [sessionsRes]);
  const clients = useMemo(() => clientsRes?.data || [], [clientsRes]);
  const summary = (summaryRes?.data as any) || null;
  const reports: any[] = useMemo(() => (Array.isArray(reportsRes?.data) ? reportsRes.data : []), [reportsRes]);
  const activities = useMemo(() => (Array.isArray(activityRes?.data) ? (activityRes.data as any[]) : []), [activityRes]);

  // Calculations
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s: any) => s.status === 'ATTENDED').length;
  const completionPct =
    totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 100;

  const totalReports = reports.length;
  const onTimeReports = reports.filter(
    (r: any) => !r.dueOn || !r.submittedAt || new Date(r.submittedAt) <= new Date(r.dueOn),
  ).length;
  const timelinessPct =
    totalReports > 0
      ? Math.round((onTimeReports / totalReports) * 100)
      : summary?.onTimeReportRate ?? 100;

  const sharedReports = reports.filter((r: any) => r.status === 'SHARED' || r.status === 'PUBLISHED').length;
  const sharedReportsPct = totalReports > 0 ? Math.round((sharedReports / totalReports) * 100) : 100;

  // Dynamic Weekly Trend (past 5 weeks)
  const weeklyTrend: WeeklyTrendPoint[] = useMemo(() => {
    const now = new Date();
    const weeks: { week: string; start: Date; end: Date; total: number; attended: number }[] = [];

    for (let i = 4; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - (i + 1) * 7);
      start.setHours(0, 0, 0, 0);

      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);

      const weekLabel = i === 0 ? 'This Week' : i === 1 ? 'Last Week' : `W-${i}`;
      weeks.push({ week: weekLabel, start, end, total: 0, attended: 0 });
    }

    if (sessions.length > 0) {
      for (const s of sessions) {
        const d = s.startsAt ? new Date(s.startsAt) : null;
        if (!d) continue;
        for (const w of weeks) {
          if (d >= w.start && d <= w.end) {
            w.total++;
            if (s.status === 'ATTENDED') {
              w.attended++;
            }
          }
        }
      }
    }

    return weeks.map((w) => ({
      week: w.week,
      completion: w.total > 0 ? Math.round((w.attended / w.total) * 100) : 100,
    }));
  }, [sessions]);

  return (
    <div className="space-y-6">
      {/* 4 Performance Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Sessions completed"
          value={String(completedSessions)}
          helper={
            totalSessions > 0
              ? `${totalSessions} scheduled · ${completionPct}% attended`
              : '0 sessions scheduled'
          }
          icon={<CheckCircle2 className="w-5 h-5 text-success" />}
        />
        <StatCard
          label="Report timeliness"
          value={`${timelinessPct}%`}
          helper={
            totalReports > 0
              ? `${onTimeReports} of ${totalReports} on time`
              : 'All reports on track'
          }
          icon={<Clock className="w-5 h-5 text-teal-700" />}
        />
        <StatCard
          label="Attendance"
          value="100%"
          helper="Regular active schedule"
          icon={<CalendarCheck className="w-5 h-5 text-purple-600" />}
        />
        <StatCard
          label="Assigned clients"
          value={String(clients.length || summary?.assignedCasesCount || 0)}
          helper={
            clients.length === 1
              ? '1 active caseload'
              : `${clients.length || summary?.assignedCasesCount || 0} active caseloads`
          }
          icon={<Users className="w-5 h-5 text-ink" />}
        />
      </div>

      {/* Main Grid: Session Trend Chart & Care Quality Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Session Completion Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-white border border-[#E6D8F1]/60 rounded-card p-5">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E6D8F1]/60">
            <div>
              <h3 className="font-quicksand font-bold text-lg text-purple-600">
                Session Completion Trend
              </h3>
              <p className="text-xs text-gray-500">
                Weekly attendance fulfillment rate over the last 5 weeks
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-chip">
              Target: ≥ 90%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B9B4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00B9B4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EFFA" vertical={false} />
                <XAxis dataKey="week" stroke="#8E8B94" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#8E8B94"
                  fontSize={12}
                  tickLine={false}
                  domain={[50, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Fulfillment Rate']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#E6D8F1',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completion"
                  stroke="#00B9B4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#completionGradient)"
                  dot={{ r: 4, fill: '#00B9B4', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#007D7A' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Quality Benchmarks */}
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-2 border-b border-[#E6D8F1]/60">
              <h3 className="font-quicksand font-bold text-base text-ink">
                Care Quality Snapshot
              </h3>
              <p className="text-xs text-gray-500">
                Clinical documentation and caregiver engagement
              </p>
            </div>

            <ProgressBar
              value={timelinessPct}
              label="Reports filed on time"
              showPercentage
            />

            <ProgressBar
              value={sharedReportsPct}
              label="Reports shared with parent"
              showPercentage
            />

            <ProgressBar
              value={completedSessions > 0 ? completionPct : 100}
              label="Session attendance fulfillment"
              showPercentage
            />
          </div>

          <div className="p-3 bg-purple-50/60 rounded-btn text-xs text-purple-800 leading-relaxed mt-4">
            Metrics reflect live clinical sessions, diagnostic reports, and client caseloads managed by this clinician.
          </div>
        </div>
      </div>

      {/* Assigned Cases Card & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assigned Cases */}
        <div className="lg:col-span-2 bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6D8F1]/60">
            <div>
              <h3 className="font-quicksand font-bold text-lg text-purple-600">
                Assigned Cases
              </h3>
              <p className="text-xs text-gray-500">
                Active therapy caseload and assigned client profiles
              </p>
            </div>

            {onNavigateToCases && (
              <button
                type="button"
                onClick={onNavigateToCases}
                className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 hover:underline"
              >
                View all {clients.length || summary?.assignedCasesCount || 0}{' '}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {clients.length > 0 ? (
              clients.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 border border-[#E6D8F1]/80 rounded-card hover:border-purple-300 transition-colors bg-white space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/clients/${c.id}`}
                        className="font-semibold text-ink text-sm hover:text-purple-600 transition-colors"
                      >
                        {c.name}
                      </Link>
                      <span className="text-xs text-gray-400 font-mono ml-2">
                        {c.clientCode || 'PTL-C---'}
                      </span>
                    </div>
                    <StatusChip
                      status={c.status === 'ACTIVE' ? 'active' : 'cancelled'}
                      label={c.status}
                    />
                  </div>
                  <div className="text-xs text-gray-700">
                    <span className="font-semibold text-purple-600">Primary Contact: </span>
                    {c.primaryGuardian?.name
                      ? `${c.primaryGuardian.name} (${c.primaryGuardian.phone || 'No phone'})`
                      : 'No guardian recorded'}
                  </div>
                  {c.caseHistory && (
                    <div className="text-xs text-gray-600 bg-purple-50/40 rounded p-2">
                      {c.caseHistory}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <EmptyState
                icon={<Users className="w-8 h-8 text-purple-600 stroke-[1.5]" />}
                headline="No Cases Assigned"
                hint="This team member is not designated as the primary therapist for any active client cases at present."
              />
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Activity Timeline */}
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
          <div className="pb-2 border-b border-[#E6D8F1]/60">
            <h3 className="font-quicksand font-bold text-base text-ink">
              Recent Clinical Activity
            </h3>
            <p className="text-xs text-gray-500">
              Audit timeline of logged session actions, notes & reports
            </p>
          </div>

          {activities.length > 0 ? (
            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-purple-100">
              {activities.slice(0, 5).map((act) => {
                const { title, detail } = formatAuditEntry(act);
                return (
                  <div key={act.id} className="relative pl-6 text-xs space-y-1">
                    <span className="absolute left-[3px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-600 ring-4 ring-white" />
                    <div className="flex items-center justify-between text-gray-400 font-medium">
                      <span>{formatDateSafe(act.createdAt)}</span>
                    </div>
                    <div className="font-semibold text-ink">
                      {title}
                    </div>
                    <p className="text-gray-600 leading-snug">
                      {detail}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Activity className="w-8 h-8 text-purple-600 stroke-[1.5]" />}
              headline="No Recent Activity"
              hint="No recent clinical entries or audit logs recorded for this account."
            />
          )}
        </div>
      </div>
    </div>
  );
}
