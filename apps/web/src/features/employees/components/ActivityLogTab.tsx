'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '@/lib/api/employees';
import { EmptyState } from '@/components/ui/EmptyState';
import { History } from 'lucide-react';
import { formatDateSafe } from '@/lib/formatters';

interface ActivityLogTabProps {
  employeeId: string;
}

export function formatAuditEntry(act: {
  action?: string;
  entity?: string;
  detail?: string;
  metadata?: any;
}) {
  if (act.detail) {
    return {
      title: act.action || act.entity || 'Clinical Action',
      detail: act.detail,
    };
  }

  const action = (act.action || '').toUpperCase();
  const entity = (act.entity || '').toLowerCase();
  const meta = act.metadata || {};

  let title = `${action} ${act.entity || ''}`.trim();
  let detail = '';

  if (entity.includes('appointment')) {
    if (meta.status === 'ATTENDED' || action === 'ATTENDED') {
      title = 'Session Attendance Recorded';
      detail = 'Marked therapy appointment as attended';
    } else if (action === 'CREATE') {
      title = 'Appointment Scheduled';
      detail = 'Created new appointment session';
    } else if (action === 'CANCEL' || meta.status === 'CANCELLED') {
      title = 'Appointment Cancelled';
      detail = meta.cancelReason ? `Cancelled: ${meta.cancelReason}` : 'Cancelled appointment session';
    } else {
      title = 'Appointment Updated';
      detail = 'Updated appointment session details';
    }
  } else if (entity.includes('report')) {
    if (action === 'CREATE') {
      title = 'Clinical Report Created';
      detail = meta.title ? `Drafted report: ${meta.title}` : 'Drafted new clinical report';
    } else if (action === 'SHARE' || action === 'PUBLISH') {
      title = 'Report Shared';
      detail = 'Shared clinical progress report with parents';
    } else {
      title = 'Report Updated';
      detail = meta.title ? `Updated report: ${meta.title}` : 'Modified clinical documentation';
    }
  } else if (entity.includes('progress') || entity.includes('goal')) {
    title = 'Goal Progress Recorded';
    detail = meta.remarks || meta.response || 'Documented client goal milestone progress';
  } else if (entity.includes('auth') || action === 'LOGIN') {
    title = 'Portal Authentication';
    detail = 'Logged into Petals ERP workspace';
  } else if (entity.includes('attendance') || action.includes('CHECK')) {
    title = action.includes('OUT') ? 'Staff Check-Out' : 'Staff Check-In';
    detail = 'Recorded daily staff attendance entry';
  } else {
    title = `${action || 'ACTION'}${act.entity ? ` · ${act.entity}` : ''}`;
    if (meta.name || meta.title || meta.description) {
      detail = meta.name || meta.title || meta.description;
    } else if (typeof meta === 'string') {
      detail = meta;
    } else {
      detail = 'Audit event recorded';
    }
  }

  return { title, detail };
}

export function ActivityLogTab({ employeeId }: ActivityLogTabProps) {
  const { data: res, isLoading } = useQuery({
    queryKey: ['employee-activity-log', employeeId],
    queryFn: () => employeesApi.getEmployeeActivityLog(employeeId),
    enabled: !!employeeId,
  });

  const logs = useMemo(() => {
    if (!res?.data || !Array.isArray(res.data) || res.data.length === 0) return [];
    return res.data as Array<{
      id: string;
      createdAt?: string;
      action?: string;
      entity?: string;
      detail?: string;
      metadata?: any;
    }>;
  }, [res]);

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
      <div className="pb-2 border-b border-[#E6D8F1]/50">
        <h3 className="font-quicksand font-bold text-lg text-purple-600">
          Activity Audit Log
        </h3>
        <p className="text-xs text-gray-500">
          Comprehensive historical log of clinical records and system events
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 pl-2">
          <div className="h-12 bg-gray-100 rounded-btn animate-pulse" />
          <div className="h-12 bg-gray-100 rounded-btn animate-pulse" />
        </div>
      ) : logs.length > 0 ? (
        <div className="space-y-4 pl-2">
          {logs.map((act) => {
            const { title, detail } = formatAuditEntry(act);
            return (
              <div
                key={act.id}
                className="border-l-2 border-purple-200 pl-4 py-1 text-sm space-y-1"
              >
                <div className="text-xs text-gray-400 font-medium">
                  {formatDateSafe(act.createdAt)}
                </div>
                <div className="font-semibold text-ink">
                  {title}
                </div>
                <div className="text-xs text-gray-600">
                  {detail}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<History className="w-8 h-8 text-purple-600 stroke-[1.5]" />}
          headline="No Activity Logged"
          hint="No recent clinical entries or audit logs recorded for this account."
        />
      )}
    </div>
  );
}
