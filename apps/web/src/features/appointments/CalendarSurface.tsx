'use client';

import React from 'react';
import { format, addDays, isSameDay, startOfWeek } from 'date-fns';
import { ExtendedAppointment } from '@/lib/api/appointments';
import { AppointmentStatus, RoleKey } from '@petals/types';
import { CLINIC_SCHEDULE_SLOTS, ScheduleSlot } from './types';
import { Clock, Plus, MapPin, User as UserIcon } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface CalendarSurfaceProps {
  currentDate: Date;
  appointments: ExtendedAppointment[];
  onSelectAppointment: (appointment: ExtendedAppointment) => void;
  onBookSlot?: (slot: ScheduleSlot, therapistId?: string, dayDate?: Date) => void;
  isLoading?: boolean;
  role: RoleKey;
  therapists: Array<{
    id: string;
    name?: string | null;
    designation?: string | null;
    departmentName?: string | null;
    department?: { name: string };
    user?: { name: string };
  }>;
}

function getAppMins(app: ExtendedAppointment): number {
  const dateStr = app.startsAt || app.startTime;
  if (!dateStr) return -1;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return -1;
  return d.getHours() * 60 + d.getMinutes();
}

function matchesSlot(appMins: number, slot: ScheduleSlot): boolean {
  if (appMins < 0) return false;
  return Math.abs(appMins - slot.startMinutes) <= 25;
}

export function CalendarSurface({
  currentDate,
  appointments = [],
  onSelectAppointment,
  onBookSlot,
  isLoading = false,
  role,
  therapists = [],
}: CalendarSurfaceProps) {
  const isDirectorOrManager = role === RoleKey.DIRECTOR || role === RoleKey.MANAGER;

  // Days for therapist weekly schedule view (Monday to Saturday)
  const weekDays = React.useMemo(() => {
    const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 6 }, (_, i) => addDays(monday, i));
  }, [currentDate]);

  const today = new Date();

  // Helper for status styles
  const getCardStyle = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.ATTENDED:
        return 'bg-teal-50/80 border-teal-300 text-teal-950 hover:bg-teal-100/80';
      case AppointmentStatus.NO_SHOW:
        return 'bg-amber-50/80 border-amber-300 text-amber-950 hover:bg-amber-100/80';
      case AppointmentStatus.CANCELLED:
        return 'bg-gray-50 border-danger/30 text-gray-500 opacity-75';
      case AppointmentStatus.SCHEDULED:
      default:
        return 'bg-purple-50/80 border-purple-300 text-purple-950 hover:bg-purple-100/80';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-12 text-center shadow-sm">
        <div className="inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-500 font-medium">Loading clinical schedule matrix...</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 1. DIRECTOR / MANAGER VIEW: Therapists on Top, Time on Left, Single Day
  // ─────────────────────────────────────────────────────────────
  if (isDirectorOrManager) {
    // If no therapists found in this branch
    if (therapists.length === 0) {
      return (
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-12 text-center shadow-sm space-y-2">
          <UserIcon className="w-10 h-10 text-purple-400 mx-auto" />
          <h3 className="font-quicksand font-bold text-base text-ink">
            No Active Therapists Found
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Please ensure staff members with the role of Therapist are assigned to this branch
            to view their daily scheduling columns.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card shadow-sm overflow-hidden flex flex-col">
        {/* Top Header Banner */}
        <div className="px-5 py-3 border-b border-[#E6D8F1]/60 bg-purple-50/40 flex items-center justify-between text-xs font-semibold text-purple-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>Daily Therapist Schedule — {format(currentDate, 'EEEE, dd MMMM yyyy')}</span>
          </div>
          <span className="text-gray-500 font-normal">
            {therapists.length} active therapists · 45-min sessions (1:15–2:00 PM lunch hidden)
          </span>
        </div>

        {/* Scrollable Matrix */}
        <div className="overflow-x-auto min-w-full">
          <table className="w-full border-collapse text-left table-fixed min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E6D8F1]/60 bg-white">
                {/* Time slot header */}
                <th className="w-[120px] p-3 text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-white z-20 border-r border-[#E6D8F1]/60 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                  Time Slot
                </th>
                {/* Therapist Column Headers */}
                {therapists.map((therapist) => {
                  const tName =
                    therapist.user?.name || therapist.name || 'Therapist';
                  const dept =
                    therapist.department?.name ||
                    therapist.departmentName ||
                    therapist.designation ||
                    'Clinical Staff';

                  return (
                    <th
                      key={therapist.id}
                      className="p-3 text-left border-r last:border-r-0 border-[#E6D8F1]/40 min-w-[190px] bg-white"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar name={tName} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-ink truncate">{tName}</p>
                          <p className="text-[11px] text-gray-400 font-medium truncate">{dept}</p>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {CLINIC_SCHEDULE_SLOTS.map((slot) => (
                <tr
                  key={slot.id}
                  className="border-b border-[#E6D8F1]/40 last:border-b-0 hover:bg-gray-50/30 transition-colors"
                >
                  {/* Left Column: Time */}
                  <td className="p-3 text-xs font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-[#E6D8F1]/60 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)] align-top">
                    <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                      <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="whitespace-nowrap">{slot.label}</span>
                    </div>
                  </td>

                  {/* Therapist Cells for this slot */}
                  {therapists.map((therapist) => {
                    // Find appointments for this therapist in this slot on currentDate
                    const cellApps = appointments.filter((app) => {
                      const appTherapistId = app.therapistId || (app.therapist as any)?.id;
                      if (appTherapistId !== therapist.id) return false;
                      const dateStr = app.startsAt || app.startTime;
                      if (!dateStr) return false;
                      const appDate = new Date(dateStr);
                      if (!isSameDay(appDate, currentDate)) return false;

                      const appMins = getAppMins(app);
                      return matchesSlot(appMins, slot);
                    });

                    return (
                      <td
                        key={therapist.id}
                        className="p-2 border-r last:border-r-0 border-[#E6D8F1]/40 align-top min-h-[72px] relative group"
                      >
                        {cellApps.length > 0 ? (
                          <div className="space-y-1.5">
                            {cellApps.map((app) => {
                              const cName =
                                app.client?.name || app.clientName || 'Client';
                              const cCode = app.clientCode || app.client?.clientCode;
                              const room = app.roomName || 'Room 1';

                              return (
                                <div
                                  key={app.id}
                                  onClick={() => onSelectAppointment(app)}
                                  className={`p-2 rounded-btn border text-xs cursor-pointer transition-all shadow-xs ${getCardStyle(
                                    app.status,
                                  )}`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold truncate">{cName}</span>
                                    {cCode && (
                                      <span className="text-[10px] px-1 py-0.2 rounded bg-white/80 font-mono font-semibold">
                                        {cCode}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-2.5 h-2.5 text-purple-600" />
                                      <span className="truncate">{room}</span>
                                    </span>
                                    <span className="capitalize text-[10px] font-semibold text-purple-700">
                                      {app.status.toLowerCase()}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="h-full min-h-[56px] rounded-btn border border-dashed border-transparent group-hover:border-purple-200 group-hover:bg-purple-50/20 flex items-center justify-center transition-colors">
                            {onBookSlot && (
                              <button
                                type="button"
                                onClick={() => onBookSlot(slot, therapist.id, currentDate)}
                                className="opacity-0 group-hover:opacity-100 text-[11px] font-semibold text-purple-700 flex items-center gap-1 px-2 py-1 rounded bg-white border border-purple-200 shadow-xs hover:bg-purple-50 transition-opacity"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Book</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. THERAPIST VIEW: Week Columns on Top, Time on Left
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card shadow-sm overflow-hidden flex flex-col">
      {/* Top Header Banner */}
      <div className="px-5 py-3 border-b border-[#E6D8F1]/60 bg-purple-50/40 flex items-center justify-between text-xs font-semibold text-purple-900">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
          <span>My Weekly Schedule (Mon – Sat)</span>
        </div>
        <span className="text-gray-500 font-normal">
          45-min clinical slots · 1:15–2:00 PM lunch hidden
        </span>
      </div>

      <div className="overflow-x-auto min-w-full">
        <table className="w-full border-collapse text-left table-fixed min-w-[700px]">
          <thead>
            <tr className="border-b border-[#E6D8F1]/60 bg-white">
              {/* Time header */}
              <th className="w-[120px] p-3 text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-white z-20 border-r border-[#E6D8F1]/60 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                Time Slot
              </th>
              {/* Days Columns */}
              {weekDays.map((day, idx) => {
                const isCurrentToday = isSameDay(day, today);
                return (
                  <th
                    key={idx}
                    className={`p-3 text-center border-r last:border-r-0 border-[#E6D8F1]/40 min-w-[150px] ${
                      isCurrentToday ? 'bg-purple-50/80 font-bold' : 'bg-white'
                    }`}
                  >
                    <div className="text-[11px] uppercase tracking-wider text-gray-500">
                      {format(day, 'EEE')}
                    </div>
                    <div
                      className={`text-sm font-quicksand font-bold ${
                        isCurrentToday ? 'text-purple-700' : 'text-ink'
                      }`}
                    >
                      {format(day, 'dd MMM')}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {CLINIC_SCHEDULE_SLOTS.map((slot) => (
              <tr
                key={slot.id}
                className="border-b border-[#E6D8F1]/40 last:border-b-0 hover:bg-gray-50/30 transition-colors"
              >
                {/* Time Slot Label */}
                <td className="p-3 text-xs font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-[#E6D8F1]/60 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)] align-top">
                  <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                    <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="whitespace-nowrap">{slot.label}</span>
                  </div>
                </td>

                {/* Day Cells */}
                {weekDays.map((day, idx) => {
                  const dayApps = appointments.filter((app) => {
                    const dateStr = app.startsAt || app.startTime;
                    if (!dateStr) return false;
                    const appDate = new Date(dateStr);
                    if (!isSameDay(appDate, day)) return false;

                    const appMins = getAppMins(app);
                    return matchesSlot(appMins, slot);
                  });

                  return (
                    <td
                      key={idx}
                      className="p-2 border-r last:border-r-0 border-[#E6D8F1]/40 align-top min-h-[72px] relative group"
                    >
                      {dayApps.length > 0 ? (
                        <div className="space-y-1.5">
                          {dayApps.map((app) => {
                            const cName =
                              app.client?.name || app.clientName || 'Client';
                            const cCode = app.clientCode || app.client?.clientCode;
                            const room = app.roomName || 'Room 1';

                            return (
                              <div
                                key={app.id}
                                onClick={() => onSelectAppointment(app)}
                                className={`p-2 rounded-btn border text-xs cursor-pointer transition-all shadow-xs ${getCardStyle(
                                  app.status,
                                )}`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold truncate">{cName}</span>
                                  {cCode && (
                                    <span className="text-[10px] px-1 py-0.2 rounded bg-white/80 font-mono font-semibold">
                                      {cCode}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5 text-purple-600" />
                                    <span className="truncate">{room}</span>
                                  </span>
                                  <span className="capitalize text-[10px] font-semibold text-purple-700">
                                    {app.status.toLowerCase()}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-full min-h-[56px] rounded-btn border border-dashed border-transparent group-hover:border-purple-200 group-hover:bg-purple-50/20 flex items-center justify-center transition-colors">
                          {onBookSlot && (
                            <button
                              type="button"
                              onClick={() => onBookSlot(slot, undefined, day)}
                              className="opacity-0 group-hover:opacity-100 text-[11px] font-semibold text-purple-700 flex items-center gap-1 px-2 py-1 rounded bg-white border border-purple-200 shadow-xs hover:bg-purple-50 transition-opacity"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Book</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
