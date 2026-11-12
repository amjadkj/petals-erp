'use client';

import React, { useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Select } from '@/components/ui/Select';
import { formatINR } from '@/lib/formatters';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon } from 'lucide-react';
import type { PnlSummary } from '../types';

interface PnlTabProps {
  initialSummary?: PnlSummary;
}

const mockMonths = [
  { value: '2026-11', label: 'November 2026' },
  { value: '2026-10', label: 'October 2026' },
  { value: '2026-09', label: 'September 2026' },
  { value: '2026-08', label: 'August 2026' },
];

export function PnlTab({ initialSummary: _initialSummary }: PnlTabProps) {
  const [selectedMonth, setSelectedMonth] = useState('2026-11');

  // Simulated P&L numbers for the chosen month
  const revenue = 372000;
  const expenses = 248000;
  const netMargin = revenue - expenses;
  const marginPercent = Math.round((netMargin / revenue) * 100);

  const branchBreakdown = [
    {
      branchName: 'Indiranagar (Main)',
      revenue: 228000,
      expenses: 145000,
      margin: 83000,
      marginPercent: 36,
    },
    {
      branchName: 'Koramangala Branch',
      revenue: 144000,
      expenses: 103000,
      margin: 41000,
      marginPercent: 28,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Month Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E6D8F1]/60 rounded-card p-4">
        <div>
          <h3 className="font-quicksand font-bold text-lg text-purple-600">
            Profit & Loss Summary
          </h3>
          <p className="text-xs text-gray-500">
            Confidential executive view of clinic financial performance
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={mockMonths}
            className="h-10 text-xs"
          />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatINR(revenue)}
          helper="Collections & session billings"
          icon={<TrendingUp className="w-5 h-5 text-success" />}
        />
        <StatCard
          label="Operating Expenses"
          value={formatINR(expenses)}
          helper="Salaries, rent, supplies, utilities"
          icon={<TrendingDown className="w-5 h-5 text-danger" />}
        />
        <StatCard
          label="Net Margin"
          value={formatINR(netMargin)}
          helper={netMargin > 0 ? '+ Positive operating cash' : 'Deficit'}
          icon={<DollarSign className="w-5 h-5 text-purple-600" />}
        />
        <StatCard
          label="Profit Margin %"
          value={`${marginPercent}%`}
          helper="Target: > 30% margin"
          icon={<PieIcon className="w-5 h-5 text-teal-700" />}
        />
      </div>

      {/* Branch Breakdown Table */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5">
        <h4 className="font-quicksand font-bold text-base text-ink mb-1">
          Branch Contribution Breakdown
        </h4>
        <p className="text-xs text-gray-500 mb-4">
          Revenue, direct costs, and net margin per clinic location
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-50 border-b border-[#E6D8F1]/60 h-10 text-[12px] font-semibold text-gray-600 uppercase">
                <th className="px-4">Branch</th>
                <th className="px-4">Revenue</th>
                <th className="px-4">Operating Expenses</th>
                <th className="px-4">Net Contribution</th>
                <th className="px-4">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6D8F1]/30 text-sm">
              {branchBreakdown.map((row) => (
                <tr key={row.branchName} className="h-12 hover:bg-purple-50/30">
                  <td className="px-4 font-semibold text-ink">{row.branchName}</td>
                  <td className="px-4 font-medium text-success">{formatINR(row.revenue)}</td>
                  <td className="px-4 font-medium text-danger">{formatINR(row.expenses)}</td>
                  <td className="px-4 font-bold text-ink">{formatINR(row.margin)}</td>
                  <td className="px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-chip text-xs font-semibold bg-teal-50 text-teal-700">
                      {row.marginPercent}%
                    </span>
                  </td>
                </tr>
              ))}
              {/* Consolidated Row */}
              <tr className="h-12 bg-purple-50/50 font-bold text-ink">
                <td className="px-4">Consolidated Total</td>
                <td className="px-4 text-success">{formatINR(revenue)}</td>
                <td className="px-4 text-danger">{formatINR(expenses)}</td>
                <td className="px-4 text-purple-600">{formatINR(netMargin)}</td>
                <td className="px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-chip text-xs font-semibold bg-purple-100 text-purple-800">
                    {marginPercent}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
