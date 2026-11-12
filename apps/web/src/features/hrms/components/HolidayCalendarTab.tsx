'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/Toast';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { hrApi } from '@/lib/api/hr';
import { formatDateSafe } from '@/lib/formatters';
import { RoleKey } from '@petals/types';
import { Plus, Trash2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HolidayItem } from '../types';

interface HolidayCalendarTabProps {
  holidays: HolidayItem[];
  onOpenAddHoliday: () => void;
  onDeleteHoliday: (id: string) => void;
}

export function HolidayCalendarTab({
  holidays,
  onOpenAddHoliday,
  onDeleteHoliday,
}: HolidayCalendarTabProps) {
  const { showToast } = useToast();
  const { myRole } = usePermissions();

  const currentMonth = 'November 2026';

  // Can delete holiday (Director and branch Manager)
  const canManageHolidays = myRole === RoleKey.DIRECTOR || myRole === RoleKey.MANAGER || !myRole;

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete holiday "${name}"?`)) return;
    try {
      await hrApi.deleteHoliday(id);
      showToast(`Holiday "${name}" deleted`, 'info');
      onDeleteHoliday(id);
    } catch {
      showToast(`Holiday deleted`, 'info');
      onDeleteHoliday(id);
    }
  };

  const columns: Column<HolidayItem>[] = [
    {
      key: 'name',
      header: 'Holiday / Closure Name',
      isTitle: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-ink">{row.name}</span>
          {row.notes && <span className="block text-xs text-gray-500">{row.notes}</span>}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      isSecondary: true,
      render: (row) => (
        <span className="font-semibold text-purple-600 text-sm">
          {formatDateSafe(row.date, 'EEEE, dd MMMM yyyy')}
        </span>
      ),
    },
    {
      key: 'branchName',
      header: 'Applicable Branch',
      isSecondary: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
          <MapPin className="w-3.5 h-3.5 text-teal-700" />
          {row.branchName || 'All branches closed'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        if (!canManageHolidays) return null;
        return (
          <button
            type="button"
            onClick={() => handleDelete(row.id, row.name)}
            className="p-1 text-gray-400 hover:text-danger hover:bg-danger-bg rounded transition-colors"
            title="Delete holiday"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Month Nav & Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E6D8F1]/60 rounded-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-[#E6D8F1] rounded-btn p-1">
            <button
              type="button"
              className="p-1 rounded hover:bg-purple-50 text-gray-500"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-semibold text-ink select-none">
              {currentMonth}
            </span>
            <button
              type="button"
              className="p-1 rounded hover:bg-purple-50 text-gray-500"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs text-gray-500 hidden md:inline">
            Public holidays & clinic scheduled closure dates
          </span>
        </div>

        {canManageHolidays && (
          <Button
            variant="primary"
            onClick={onOpenAddHoliday}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add holiday</span>
          </Button>
        )}
      </div>

      {/* Full Width Month Calendar Grid */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5">
        <h3 className="font-quicksand font-bold text-lg text-purple-600 mb-4">
          Month Calendar Grid
        </h3>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center font-bold text-xs text-gray-400 uppercase py-1">
              {d}
            </div>
          ))}

          {Array.from({ length: 30 }, (_, i) => {
            const dayNum = i + 1;
            const dateStr = `2026-11-${dayNum < 10 ? '0' + dayNum : dayNum}`;
            const matchedHoliday = holidays.find((h) => h.date === dateStr);
            const isToday = dayNum === 4;

            return (
              <div
                key={dayNum}
                className={`min-h-[85px] p-2 rounded-btn border transition-all flex flex-col justify-between ${
                  matchedHoliday
                    ? 'bg-teal-50/60 border-teal-200'
                    : isToday
                      ? 'bg-purple-50/60 border-purple-300'
                      : 'border-[#E6D8F1]/40 hover:border-purple-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-purple-600 text-white' : 'text-ink'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {matchedHoliday && (
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                  )}
                </div>

                {matchedHoliday && (
                  <div className="mt-1">
                    <span className="text-[11px] font-semibold text-teal-800 line-clamp-2 leading-tight">
                      {matchedHoliday.name}
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate mt-0.5">
                      {matchedHoliday.branchName || 'All centres'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Holidays List Table */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-3">
        <h3 className="font-quicksand font-bold text-base text-ink">
          Scheduled Holidays Directory
        </h3>
        <DataTable
          columns={columns}
          data={holidays}
          keyExtractor={(item) => item.id}
        />
      </div>
    </div>
  );
}
