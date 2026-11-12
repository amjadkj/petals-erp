'use client';

import React from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { formatINR } from '@/lib/formatters';
import type { MonthlyTrackingRow } from '../types';

interface MonthlyTrackingTabProps {
  branchId?: string;
}

const mockTrackingData: MonthlyTrackingRow[] = [
  { month: 'November 2026 (MTD)', billed: 372000, collected: 324000, pending: 48000, collectionRate: 87 },
  { month: 'October 2026', billed: 385000, collected: 370000, pending: 15000, collectionRate: 96 },
  { month: 'September 2026', billed: 360000, collected: 345000, pending: 15000, collectionRate: 95 },
  { month: 'August 2026', billed: 340000, collected: 332000, pending: 8000, collectionRate: 97 },
  { month: 'July 2026', billed: 310000, collected: 300000, pending: 10000, collectionRate: 96 },
  { month: 'June 2026', billed: 280000, collected: 275000, pending: 5000, collectionRate: 98 },
];

export function MonthlyTrackingTab({ branchId: _branchId }: MonthlyTrackingTabProps) {
  const columns: Column<MonthlyTrackingRow>[] = [
    {
      key: 'month',
      header: 'Billing Month',
      isTitle: true,
      render: (row) => <span className="font-semibold text-ink">{row.month}</span>,
    },
    {
      key: 'billed',
      header: 'Billed Amount',
      isSecondary: true,
      render: (row) => <span className="text-gray-700 font-medium text-sm">{formatINR(row.billed)}</span>,
    },
    {
      key: 'collected',
      header: 'Collected',
      isSecondary: true,
      render: (row) => <span className="text-success font-semibold text-sm">{formatINR(row.collected)}</span>,
    },
    {
      key: 'pending',
      header: 'Pending Balance',
      isSecondary: true,
      render: (row) => (
        <span className={`font-semibold text-sm ${row.pending > 0 ? 'text-danger' : 'text-gray-400'}`}>
          {formatINR(row.pending)}
        </span>
      ),
    },
    {
      key: 'collectionRate',
      header: 'Collection Rate',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-purple-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.collectionRate >= 95 ? 'bg-success' : 'bg-teal-500'
              }`}
              style={{ width: `${row.collectionRate}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-ink">{row.collectionRate}%</span>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
      <div className="pb-2 border-b border-[#E6D8F1]/60">
        <h3 className="font-quicksand font-bold text-lg text-purple-600">
          Monthly Billing & Collection Tracking
        </h3>
        <p className="text-xs text-gray-500">
          Summary of total fees billed vs received across all active client accounts
        </p>
      </div>

      <DataTable
        columns={columns}
        data={mockTrackingData}
        keyExtractor={(item) => item.month}
      />
    </div>
  );
}
