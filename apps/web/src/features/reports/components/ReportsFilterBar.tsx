'use client';

import React from 'react';
import { Input, Select, Switch, Button } from '@/components/ui';
import { Search, RotateCcw } from 'lucide-react';
import { ReportType, ReportStatus, RoleKey } from '@petals/types';
import type { ReportsFilterState } from '../types';

interface ReportsFilterBarProps {
  filters: ReportsFilterState;
  onChange: (filters: ReportsFilterState) => void;
  roleKey?: RoleKey | string | null;
  therapists?: Array<{ id: string; name: string }>;
}

export function ReportsFilterBar({
  filters,
  onChange,
  roleKey,
  therapists = [],
}: ReportsFilterBarProps) {
  const isParent = roleKey === RoleKey.PARENT;
  const isTherapist = roleKey === RoleKey.THERAPIST;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, type: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, status: e.target.value });
  };

  const handleTherapistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, therapistId: e.target.value });
  };

  const handleOverdueToggle = (checked: boolean) => {
    onChange({ ...filters, overdueOnly: checked });
  };

  const handleReset = () => {
    onChange({
      search: '',
      therapistId: '',
      type: '',
      status: '',
      overdueOnly: false,
    });
  };

  const isFiltered =
    !!filters.search ||
    !!filters.therapistId ||
    !!filters.type ||
    !!filters.status ||
    filters.overdueOnly;

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <Input
          placeholder="Search by client or report title..."
          value={filters.search}
          onChange={handleSearchChange}
          leadingIcon={<Search className="w-4 h-4 text-gray-400" />}
          className="h-10 text-sm"
        />

        {/* Type Filter */}
        <Select
          value={filters.type}
          onChange={handleTypeChange}
          className="h-10 text-sm"
          options={[
            { value: '', label: 'All Report Types' },
            { value: ReportType.ASSESSMENT, label: 'Assessment' },
            { value: ReportType.PROGRESS, label: 'Progress' },
            { value: ReportType.DISCHARGE, label: 'Discharge' },
            { value: ReportType.OTHER, label: 'Other' },
          ]}
        />

        {/* Status Filter (hidden for parent who only sees shared) */}
        {!isParent && (
          <Select
            value={filters.status}
            onChange={handleStatusChange}
            className="h-10 text-sm"
            options={[
              { value: '', label: 'All Statuses' },
              { value: ReportStatus.DRAFT, label: 'Draft' },
              { value: ReportStatus.SUBMITTED, label: 'Submitted' },
              { value: ReportStatus.REVIEWED, label: 'Reviewed' },
              { value: ReportStatus.SHARED, label: 'Shared with Parents' },
            ]}
          />
        )}

        {/* Therapist filter (for director/manager) */}
        {!isParent && !isTherapist && (
          <Select
            value={filters.therapistId}
            onChange={handleTherapistChange}
            className="h-10 text-sm"
            options={[
              { value: '', label: 'All Therapists' },
              ...therapists.map((t) => ({ value: t.id, label: t.name })),
            ]}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6D8F1]/30">
        {!isParent && (
          <div className="flex items-center gap-2">
            <Switch
              checked={filters.overdueOnly}
              onChange={handleOverdueToggle}
              id="overdue-only-toggle"
              label="Overdue only"
            />
          </div>
        )}

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

