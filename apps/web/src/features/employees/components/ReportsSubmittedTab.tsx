'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusChip } from '@/components/ui/StatusChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateSafe } from '@/lib/formatters';
import { fetcher } from '@/lib/api/fetcher';
import { FileText } from 'lucide-react';
import type { ApiResponse } from '@petals/types';

interface ReportsSubmittedTabProps {
  employeeId: string;
}

interface ReportRow {
  id: string;
  title: string;
  clientName: string;
  type?: string;
  status: string;
  createdAt: string;
}

export function ReportsSubmittedTab({ employeeId }: ReportsSubmittedTabProps) {
  const { data: res, isLoading } = useQuery({
    queryKey: ['employee-reports', employeeId],
    queryFn: () =>
      fetcher<ApiResponse<ReportRow[]>>(`/reports?authorId=${employeeId}`).catch(
        () => ({ data: [] } as any),
      ),
    enabled: !!employeeId,
  });

  const reports = useMemo(() => {
    if (!res?.data || !Array.isArray(res.data) || res.data.length === 0) return [];
    return res.data;
  }, [res]);

  const columns: Column<ReportRow>[] = [
    {
      key: 'title',
      header: 'Report Title',
      isTitle: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-ink">{row.title || 'Clinical Report'}</span>
          <span className="block text-xs text-gray-500">
            {row.clientName ? `Client: ${row.clientName}` : row.type || 'Evaluation'}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created On',
      isSecondary: true,
      render: (row) => (
        <span className="text-gray-700 text-sm">{formatDateSafe(row.createdAt)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      isStatus: true,
      render: (row) => (
        <StatusChip
          status={row.status === 'PUBLISHED' || row.status === 'REVIEWED' ? 'paid' : 'active'}
          label={row.status || 'Draft'}
        />
      ),
    },
  ];

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-3">
      <div className="pb-2 border-b border-[#E6D8F1]/50">
        <h3 className="font-quicksand font-bold text-lg text-purple-600">
          Reports Submitted
        </h3>
        <p className="text-xs text-gray-500">
          Formal assessment summaries, progress evaluations, and discharge reports
        </p>
      </div>

      {reports.length > 0 ? (
        <DataTable
          columns={columns}
          data={reports}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
        />
      ) : (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-purple-600 stroke-[1.5]" />}
          headline="No Reports Filed"
          hint="No clinical reports or diagnostic evaluations have been filed by this author yet."
        />
      )}
    </div>
  );
}
