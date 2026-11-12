'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusChip } from '@/components/ui/StatusChip';
import { formatDateSafe, computeAge } from '@/lib/formatters';
import { LeadStage } from '@petals/types';
import type { LeadItem } from '../types';

interface LeadsListProps {
  leads: LeadItem[];
  onRowClick: (lead: LeadItem) => void;
  isLoading?: boolean;
}

export function LeadsList({ leads, onRowClick, isLoading = false }: LeadsListProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const paginatedData = leads.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<LeadItem>[] = [
    {
      key: 'childName',
      header: 'Child',
      isTitle: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-ink">{row.childName}</span>
          <span className="block text-xs text-gray-500">{row.parentName} · {row.phone}</span>
        </div>
      ),
    },
    {
      key: 'age',
      header: 'Age',
      isSecondary: true,
      render: (row) => <span className="text-gray-600 text-sm">{computeAge(row.childDob)}</span>,
    },
    {
      key: 'concerns',
      header: 'Concern',
      isSecondary: true,
      render: (row) => (
        <span className="text-gray-700 text-sm font-medium line-clamp-1">
          {row.concerns || '—'}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (row) => <span className="text-gray-600 text-sm">{row.source || 'Website'}</span>,
    },
    {
      key: 'ownerName',
      header: 'Owner',
      render: (row) => (
        <span className="text-gray-700 text-sm font-medium">
          {row.ownerName || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'stage',
      header: 'Stage',
      isStatus: true,
      render: (row) => {
        let status = 'pending';
        if (row.stage === LeadStage.CONVERTED) status = 'active';
        else if (row.stage === LeadStage.LOST) status = 'cancelled';
        else if (row.stage === LeadStage.CONTACTED) status = 'scheduled';
        return <StatusChip status={status} label={row.stage.replace(/_/g, ' ')} />;
      },
    },
    {
      key: 'followUpDate',
      header: 'Follow-up Date',
      render: (row) => {
        const isOverdue = row.isOverdue || (row.stage !== LeadStage.CONVERTED && row.stage !== LeadStage.LOST && row.followUpDate && new Date(row.followUpDate) < new Date());
        return (
          <span className={`text-sm ${isOverdue ? 'text-danger font-semibold' : 'text-gray-600'}`}>
            {formatDateSafe(row.followUpDate || row.createdAt)}
            {isOverdue && ' (Overdue)'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5">
      <DataTable
        columns={columns}
        data={paginatedData}
        keyExtractor={(item) => item.id}
        onRowClick={onRowClick}
        page={page}
        pageSize={pageSize}
        total={leads.length}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
