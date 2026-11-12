'use client';

import React from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusChip } from '@/components/ui/StatusChip';
import { formatDateSafe } from '@/lib/formatters';
import type { EmployeeReportItem } from '../types';

interface ReportsSubmittedTabProps {
  employeeId: string;
}

const mockReports: EmployeeReportItem[] = [
  { id: 'rep-1', title: 'Comprehensive Speech Assessment', clientName: 'Aarav Sharma', dueOn: '2026-11-05', submittedOn: '2026-11-04', isOnTime: true, status: 'Reviewed' },
  { id: 'rep-2', title: 'Mid-term Language Evaluation', clientName: 'Diya Patel', dueOn: '2026-11-02', submittedOn: '2026-11-02', isOnTime: true, status: 'Reviewed' },
  { id: 'rep-3', title: 'Articulation Progress Summary', clientName: 'Kabir Verma', dueOn: '2026-10-25', submittedOn: '2026-10-24', isOnTime: true, status: 'Shared with parent' },
  { id: 'rep-4', title: 'Sensory Communication Report', clientName: 'Vihaan Joshi', dueOn: '2026-10-18', submittedOn: '2026-10-19', isOnTime: false, status: 'Reviewed' },
];

export function ReportsSubmittedTab({ employeeId: _employeeId }: ReportsSubmittedTabProps) {
  const columns: Column<EmployeeReportItem>[] = [
    {
      key: 'title',
      header: 'Report Title',
      isTitle: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-ink">{row.title}</span>
          <span className="block text-xs text-gray-500">Client: {row.clientName}</span>
        </div>
      ),
    },
    {
      key: 'dueOn',
      header: 'Due Date',
      isSecondary: true,
      render: (row) => <span className="text-gray-600 text-sm">{formatDateSafe(row.dueOn)}</span>,
    },
    {
      key: 'submittedOn',
      header: 'Submitted On',
      isSecondary: true,
      render: (row) => <span className="text-gray-700 text-sm">{formatDateSafe(row.submittedOn)}</span>,
    },
    {
      key: 'isOnTime',
      header: 'Timeliness',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-chip text-xs font-semibold ${
            row.isOnTime ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
          }`}
        >
          {row.isOnTime ? 'On Time' : 'Delayed'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      isStatus: true,
      render: (row) => <StatusChip status="paid" label={row.status} />,
    },
  ];

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-3">
      <div className="pb-2 border-b border-[#E6D8F1]/50">
        <h3 className="font-quicksand font-bold text-lg text-purple-600">
          Clinical Reports Submitted
        </h3>
        <p className="text-xs text-gray-500">
          Evaluations, assessments, and quarterly progress summaries
        </p>
      </div>

      <DataTable
        columns={columns}
        data={mockReports}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
