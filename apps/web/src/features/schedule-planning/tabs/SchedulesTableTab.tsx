'use client';

import React from 'react';
import { StatusChip, useToast } from '@/components/ui';
import { RecurringScheduleRow } from '../types';
import { getInitials, getAvatarColorClass } from '@/lib/utils';
import { Pause, Play, Ban, Repeat } from 'lucide-react';

interface SchedulesTableTabProps {
  schedules: RecurringScheduleRow[];
  onRefresh: () => void;
}

export function SchedulesTableTab({ schedules, onRefresh }: SchedulesTableTabProps) {
  const { showToast } = useToast();

  const handleToggleStatus = (schedule: RecurringScheduleRow) => {
    const nextStatus = schedule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    showToast(`Schedule for ${schedule.clientName} set to ${nextStatus.toLowerCase()}.`, 'info');
    onRefresh();
  };

  const handleEndSchedule = (schedule: RecurringScheduleRow) => {
    if (!window.confirm(`Are you sure you want to end recurring schedule for ${schedule.clientName}?`)) return;
    showToast(`Recurring schedule ended for ${schedule.clientName}.`, 'success');
    onRefresh();
  };

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#E6D8F1]/40 flex items-center justify-between">
        <div>
          <h3 className="font-quicksand font-bold text-base text-ink">
            Recurring Client Schedules
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Automatic 8-week forward rolling appointment generation
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-500">
          {schedules.length} recurring rule{schedules.length === 1 ? '' : 's'}
        </span>
      </div>

      {schedules.length === 0 ? (
        <div className="py-14 text-center text-sm text-gray-500">
          No recurring schedules configured yet.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="bg-purple-50/70 border-b border-[#E6D8F1]/60 h-11 text-[12px] font-semibold text-gray-600 uppercase tracking-wider select-none">
                  <th className="px-5">Client</th>
                  <th className="px-4">Department</th>
                  <th className="px-4">Therapist</th>
                  <th className="px-4">Recurrence Rule</th>
                  <th className="px-4 text-center">Duration</th>
                  <th className="px-4">Validity</th>
                  <th className="px-4 text-center">Status</th>
                  <th className="px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6D8F1]/30">
                {schedules.map((row) => {
                  const avatarColor = getAvatarColorClass(row.clientName || row.id);
                  const initials = getInitials(row.clientName);

                  return (
                    <tr key={row.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-quicksand font-bold text-xs shrink-0 ${avatarColor}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-ink">{row.clientName}</div>
                            <div className="text-xs text-gray-500">{row.clientCode || '—'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-gray-700">
                        {row.departmentName}
                      </td>

                      <td className="px-4 py-3.5 text-gray-700">
                        {row.therapistName}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-semibold text-purple-800">
                          <Repeat className="w-3.5 h-3.5 text-purple-600" />
                          <span>{row.ruleInWords}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center text-gray-600">
                        {row.durationMinutes} min
                      </td>

                      <td className="px-4 py-3.5 text-xs text-gray-500">
                        {row.startsOn} {row.endsOn ? `to ${row.endsOn}` : '· Ongoing'}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <StatusChip status={row.status} />
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(row)}
                            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-btn transition-colors"
                            title={row.status === 'ACTIVE' ? 'Pause schedule' : 'Resume schedule'}
                          >
                            {row.status === 'ACTIVE' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEndSchedule(row)}
                            className="p-1.5 text-gray-400 hover:text-danger hover:bg-danger-bg rounded-btn transition-colors"
                            title="End schedule"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-[#E6D8F1]/40">
            {schedules.map((row) => (
              <div key={row.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-ink">{row.clientName}</div>
                  <StatusChip status={row.status} />
                </div>

                <div className="text-xs text-purple-800 font-semibold flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5" />
                  <span>{row.ruleInWords} ({row.durationMinutes}m)</span>
                </div>

                <div className="text-xs text-gray-500">
                  {row.departmentName} · {row.therapistName}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-[#E6D8F1]/30">
                  <span>Starts: {row.startsOn}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(row)}
                      className="text-purple-600 font-semibold hover:underline"
                    >
                      {row.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => handleEndSchedule(row)}
                      className="text-danger font-semibold hover:underline"
                    >
                      End
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
