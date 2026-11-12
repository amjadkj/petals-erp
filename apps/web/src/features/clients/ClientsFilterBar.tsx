'use client';

import React, { useState } from 'react';
import { Input, Select, Button, FiltersSheet } from '@/components/ui';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { ClientFiltersState } from './types';

interface ClientsFilterBarProps {
  filters: ClientFiltersState;
  onFilterChange: (updates: Partial<ClientFiltersState>) => void;
  onReset: () => void;
  departments?: Array<{ id: string; name: string }>;
  therapists?: Array<{ id: string; name: string }>;
}

export function ClientsFilterBar({
  filters,
  onFilterChange,
  onReset,
  departments = [],
  therapists = [],
}: ClientsFilterBarProps) {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const deptOptions = [
    { value: 'ALL', label: 'All departments' },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ];

  const therapistOptions = [
    { value: 'ALL', label: 'All therapists' },
    ...therapists.map((t) => ({ value: t.id, label: t.name })),
  ];

  const statusOptions = [
    { value: 'ALL', label: 'All statuses' },
    { value: 'ACTIVE', label: 'Active clients' },
    { value: 'ON_HOLD', label: 'On hold' },
    { value: 'DISCHARGED', label: 'Discharged' },
  ];

  const activeFilterCount =
    (filters.departmentId !== 'ALL' ? 1 : 0) +
    (filters.therapistId !== 'ALL' ? 1 : 0) +
    (filters.status !== 'ALL' ? 1 : 0);

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
      {/* Search Input - stays visible on both desktop & mobile */}
      <div className="flex-1 min-w-[200px] max-w-md">
        <Input
          placeholder="Search clients (name or code)..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
          leadingIcon={<Search className="w-4 h-4" />}
          className="h-10 text-xs md:text-sm"
        />
      </div>

      {/* Desktop Filters (>= 768px) */}
      <div className="hidden md:flex items-center gap-3">
        <div className="w-44">
          <Select
            value={filters.departmentId}
            onChange={(e) => onFilterChange({ departmentId: e.target.value, page: 1 })}
            options={deptOptions}
            className="h-10 text-xs md:text-sm"
          />
        </div>

        <div className="w-44">
          <Select
            value={filters.therapistId}
            onChange={(e) => onFilterChange({ therapistId: e.target.value, page: 1 })}
            options={therapistOptions}
            className="h-10 text-xs md:text-sm"
          />
        </div>

        <div className="w-40">
          <Select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
            options={statusOptions}
            className="h-10 text-xs md:text-sm"
          />
        </div>

        {(filters.search || activeFilterCount > 0) && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 px-2 py-1.5 rounded transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Mobile Filter Button (< 768px) */}
      <div className="md:hidden flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setMobileSheetOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 h-10 text-xs border-purple-200 text-purple-800"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-[10px]">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {(filters.search || activeFilterCount > 0) && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 p-2 rounded"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Mobile Filters Bottom Sheet */}
      <FiltersSheet
        isOpen={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        onReset={onReset}
      >
        <Select
          label="Department"
          value={filters.departmentId}
          onChange={(e) => onFilterChange({ departmentId: e.target.value, page: 1 })}
          options={deptOptions}
        />
        <Select
          label="Therapist"
          value={filters.therapistId}
          onChange={(e) => onFilterChange({ therapistId: e.target.value, page: 1 })}
          options={therapistOptions}
        />
        <Select
          label="Status"
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
          options={statusOptions}
        />
      </FiltersSheet>
    </div>
  );
}
