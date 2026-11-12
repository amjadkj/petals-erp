'use client';

import React from 'react';
import { Input, Select, Button } from '@/components/ui';
import type { AuditLogFilterState } from '../types';
import type { UserSummary, BranchDto } from '@petals/types';
import { Search, RotateCcw } from 'lucide-react';

interface AuditLogFilterBarProps {
  filters: AuditLogFilterState;
  onChange: (filters: AuditLogFilterState) => void;
  users: UserSummary[];
  branches: BranchDto[];
}

export function AuditLogFilterBar({
  filters,
  onChange,
  users,
  branches,
}: AuditLogFilterBarProps) {
  const handleReset = () => {
    onChange({
      userId: '',
      entity: '',
      branchId: '',
      startDate: '',
      endDate: '',
      search: '',
    });
  };

  const isFiltered =
    !!filters.userId ||
    !!filters.entity ||
    !!filters.branchId ||
    !!filters.startDate ||
    !!filters.endDate ||
    !!filters.search;

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <Input
          placeholder="Search action or summary..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          leadingIcon={<Search className="w-4 h-4 text-gray-400" />}
          className="h-10 text-sm"
        />

        {/* User filter */}
        <Select
          value={filters.userId}
          onChange={(e) => onChange({ ...filters, userId: e.target.value })}
          className="h-10 text-sm"
          options={[
            { value: '', label: 'All Users' },
            ...users.map((u) => ({ value: u.id, label: `${u.name} (${u.roleKey})` })),
          ]}
        />

        {/* Entity filter */}
        <Select
          value={filters.entity}
          onChange={(e) => onChange({ ...filters, entity: e.target.value })}
          className="h-10 text-sm"
          options={[
            { value: '', label: 'All Entities' },
            { value: 'User', label: 'User' },
            { value: 'Branch', label: 'Branch' },
            { value: 'Client', label: 'Client' },
            { value: 'Assessment', label: 'Assessment' },
            { value: 'Report', label: 'Report' },
            { value: 'Invoice', label: 'Invoice' },
            { value: 'Communication', label: 'Communication' },
            { value: 'RolePermission', label: 'Role & Permissions' },
          ]}
        />

        {/* Branch filter */}
        <Select
          value={filters.branchId}
          onChange={(e) => onChange({ ...filters, branchId: e.target.value })}
          className="h-10 text-sm"
          options={[
            { value: '', label: 'All Branches' },
            ...branches.map((b) => ({ value: b.id, label: `${b.name} (${b.code})` })),
          ]}
        />
      </div>

      {/* Date Range & Reset Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6D8F1]/30">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Date Range:</span>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            className="h-8 text-xs w-36"
          />
          <span className="text-gray-400">to</span>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            className="h-8 text-xs w-36"
          />
        </div>

        {isFiltered && (
          <Button
            variant="outline"
            onClick={handleReset}
            className="h-8 px-2.5 text-xs text-gray-600 hover:text-ink flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </Button>
        )}
      </div>
    </div>
  );
}

