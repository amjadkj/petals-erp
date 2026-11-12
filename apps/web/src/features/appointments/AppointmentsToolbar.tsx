'use client';

import React from 'react';
import { format, addWeeks, subWeeks, addDays, subDays, addMonths, subMonths } from 'date-fns';
import { SegmentedControl, Select, Button } from '@/components/ui';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarViewMode, AppointmentFiltersState } from './types';
import { RoleKey } from '@petals/types';

interface AppointmentsToolbarProps {
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (newMode: CalendarViewMode) => void;
  filters: AppointmentFiltersState;
  onFilterChange: (updates: Partial<AppointmentFiltersState>) => void;
  therapists?: Array<{ id: string; name: string }>;
  departments?: Array<{ id: string; name: string }>;
  role: RoleKey;
}

export function AppointmentsToolbar({
  currentDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  filters,
  onFilterChange,
  therapists = [],
  departments = [],
  role,
}: AppointmentsToolbarProps) {
  const isTherapist = role === RoleKey.THERAPIST;
  const isParent = role === RoleKey.PARENT;

  // Step forwards/backwards based on current view mode
  const handlePrev = () => {
    if (viewMode === 'day') onDateChange(subDays(currentDate, 1));
    else if (viewMode === 'month') onDateChange(subMonths(currentDate, 1));
    else onDateChange(subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'day') onDateChange(addDays(currentDate, 1));
    else if (viewMode === 'month') onDateChange(addMonths(currentDate, 1));
    else onDateChange(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Compute label
  const rangeLabel = React.useMemo(() => {
    if (viewMode === 'day') {
      return format(currentDate, 'EEEE, dd MMM yyyy');
    }
    if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy');
    }
    // Week: Monday to Sunday
    const dayOfWeek = currentDate.getDay(); // 0 is Sun
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = addDays(currentDate, distanceToMonday);
    const sunday = addDays(monday, 6);

    const sameMonth = monday.getMonth() === sunday.getMonth();
    if (sameMonth) {
      return `${format(monday, 'dd')} – ${format(sunday, 'dd MMM yyyy')}`;
    }
    return `${format(monday, 'dd MMM')} – ${format(sunday, 'dd MMM yyyy')}`;
  }, [currentDate, viewMode]);

  const viewOptions = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

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
      {/* Row 1: Navigation & Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Prev / Next */}
          <div className="flex items-center border border-[#E6D8F1]/60 rounded-btn overflow-hidden">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 hover:bg-purple-50 text-ink transition-colors"
              aria-label="Previous date range"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-2 hover:bg-purple-50 text-ink transition-colors border-l border-[#E6D8F1]/60"
              aria-label="Next date range"
            >
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

          {/* Date Range Label with mini date input picker */}
          <div className="relative flex items-center">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-purple-50/50 hover:bg-purple-50 border border-purple-200 text-xs md:text-sm font-bold text-purple-900 cursor-pointer transition-colors">
              <CalendarIcon className="w-4 h-4 text-purple-600" />
              <span>{rangeLabel}</span>
              <input
                type="date"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.value) {
                    onDateChange(new Date(e.target.value));
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Day | Week | Month segmented control */}
        <div>
          <SegmentedControl
            value={viewMode}
            onChange={(val) => onViewModeChange(val as CalendarViewMode)}
            options={viewOptions}
            size="sm"
          />
        </div>
      </div>

      {/* Row 2: Filters & Legend */}
      {!isParent && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-3 border-t border-[#E6D8F1]/40 flex-wrap">
          <div className="flex items-center gap-2.5 flex-wrap">
            {!isTherapist && (
              <div className="w-44">
                <Select
                  value={filters.therapistId}
                  onChange={(e) => onFilterChange({ therapistId: e.target.value })}
                  options={therapistOptions}
                  className="h-9 text-xs"
                />
              </div>
            )}

            <div className="w-44">
              <Select
                value={filters.departmentId}
                onChange={(e) => onFilterChange({ departmentId: e.target.value })}
                options={deptOptions}
                className="h-9 text-xs"
              />
            </div>

            <div className="w-36">
              <Select
                value={filters.status}
                onChange={(e) => onFilterChange({ status: e.target.value })}
                options={statusOptions}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
              Speech
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
              OT
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block" />
              Cancelled
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
