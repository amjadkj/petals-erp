'use client';

import React from 'react';
import { format, addWeeks, subWeeks, addDays, subDays, startOfWeek } from 'date-fns';
import { Select, Button } from '@/components/ui';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { AppointmentFiltersState } from './types';
import { RoleKey } from '@petals/types';

interface AppointmentsToolbarProps {
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  filters: AppointmentFiltersState;
  onFilterChange: (updates: Partial<AppointmentFiltersState>) => void;
  therapists?: Array<{ id: string; name: string }>;
  departments?: Array<{ id: string; name: string }>;
  role: RoleKey;
}

export function AppointmentsToolbar({
  currentDate,
  onDateChange,
  filters,
  onFilterChange,
  therapists = [],
  departments = [],
  role,
}: AppointmentsToolbarProps) {
  const isDirectorOrManager = role === RoleKey.DIRECTOR || role === RoleKey.MANAGER;

  const handlePrev = () => {
    if (isDirectorOrManager) onDateChange(subDays(currentDate, 1));
    else onDateChange(subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    if (isDirectorOrManager) onDateChange(addDays(currentDate, 1));
    else onDateChange(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const rangeLabel = React.useMemo(() => {
    if (isDirectorOrManager) {
      return format(currentDate, 'EEEE, dd MMMM yyyy');
    }
    const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
    const saturday = addDays(monday, 5);
    return `${format(monday, 'dd MMM')} – ${format(saturday, 'dd MMM yyyy')}`;
  }, [currentDate, isDirectorOrManager]);

  const therapistOptions = [
    { value: 'ALL', label: 'All therapists' },
    ...therapists.map((t) => ({ value: t.id, label: t.name })),
  ];

  const deptOptions = [
    { value: 'ALL', label: 'All departments' },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ];

  const statusOptions = [
    { value: 'ALL', label: 'All statuses' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'ATTENDED', label: 'Attended' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO_SHOW', label: 'No Show' },
  ];

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-4 space-y-3.5 shadow-sm">
      {/* Row 1: Date Navigation Buttons & Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Prev / Next Day or Week */}
          <div className="flex items-center border border-[#E6D8F1]/60 rounded-btn overflow-hidden bg-white shadow-xs">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 hover:bg-purple-50 text-ink transition-colors flex items-center gap-1 text-xs font-semibold px-2.5"
              aria-label={isDirectorOrManager ? 'Previous day' : 'Previous week'}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isDirectorOrManager ? 'Prev Day' : 'Prev Week'}
              </span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-2 hover:bg-purple-50 text-ink transition-colors border-l border-[#E6D8F1]/60 flex items-center gap-1 text-xs font-semibold px-2.5"
              aria-label={isDirectorOrManager ? 'Next day' : 'Next week'}
            >
              <span className="hidden sm:inline">
                {isDirectorOrManager ? 'Next Day' : 'Next Week'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleToday}
            className="h-9 px-3 text-xs md:text-sm border-purple-200 text-purple-800 hover:bg-purple-50"
          >
            Today
          </Button>

          {/* Date Picker Input & Display */}
          <div className="relative flex items-center">
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-btn bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs md:text-sm font-bold text-purple-900 cursor-pointer transition-colors shadow-xs">
              <CalendarIcon className="w-4 h-4 text-purple-600 shrink-0" />
              <span>{rangeLabel}</span>
              <input
                type="date"
                value={format(currentDate, 'yyyy-MM-dd')}
                className="sr-only"
                onChange={(e) => {
                  if (e.target.value) {
                    onDateChange(new Date(e.target.value + 'T00:00:00'));
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* View Badge info */}
        <div className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-btn border border-gray-100">
          {isDirectorOrManager ? 'Single-Day Matrix' : 'Weekly Personal Schedule'}
        </div>
      </div>

      {/* Row 2: Filtering Controls */}
      <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-[#E6D8F1]/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-purple-600" />
          <span>Filters:</span>
        </div>

        {/* Department Filter */}
        <div className="w-44">
          <Select
            value={filters.departmentId}
            onChange={(e) => onFilterChange({ departmentId: e.target.value })}
            options={deptOptions}
            className="h-8 text-xs"
          />
        </div>

        {/* Status Filter */}
        <div className="w-36">
          <Select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            options={statusOptions}
            className="h-8 text-xs"
          />
        </div>

        {/* Therapist Spotlight Filter (Director/Manager) */}
        {isDirectorOrManager && therapists.length > 0 && (
          <div className="w-44">
            <Select
              value={filters.therapistId}
              onChange={(e) => onFilterChange({ therapistId: e.target.value })}
              options={therapistOptions}
              className="h-8 text-xs"
            />
          </div>
        )}

        {(filters.departmentId !== 'ALL' ||
          filters.status !== 'ALL' ||
          filters.therapistId !== 'ALL') && (
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                departmentId: 'ALL',
                status: 'ALL',
                therapistId: 'ALL',
              })
            }
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
