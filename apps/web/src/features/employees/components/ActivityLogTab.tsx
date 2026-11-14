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
          {logs.map((act) => (
            <div
              key={act.id}
              className="border-l-2 border-purple-200 pl-4 py-1 text-sm space-y-1"
            >
              <div className="text-xs text-gray-400 font-medium">
                {formatDateSafe(act.createdAt)}
              </div>
              <div className="font-semibold text-ink">
                {act.action || act.entity || 'System Action'}
              </div>
              <div className="text-xs text-gray-600">
                {act.detail || JSON.stringify(act.metadata || {})}
              </div>
            </div>
          ))}
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
