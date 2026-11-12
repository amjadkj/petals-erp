'use client';

import React from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { ExtendedAppointment } from '@/lib/api/appointments';
import { AppointmentStatus } from '@petals/types';
import { AlertTriangle } from 'lucide-react';

interface CalendarSurfaceProps {
  currentDate: Date;
  appointments: ExtendedAppointment[];
  onSelectAppointment: (appointment: ExtendedAppointment) => void;
  isLoading?: boolean;
}

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const HOUR_HEIGHT = 64; // 64px per hour

export function CalendarSurface({
  currentDate,
  appointments = [],
  onSelectAppointment,
  isLoading = false,
}: CalendarSurfaceProps) {
  // Compute Monday to Sunday of the current week
  const daysOfWeek = React.useMemo(() => {
    const dayOfWeek = currentDate.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = addDays(currentDate, distanceToMonday);

    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [currentDate]);

  const today = new Date();

  // Current time line calculation
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isNowWithinHours = currentHour >= 9 && currentHour <= 18;
  const nowTopPx = isNowWithinHours
    ? ((currentHour - 9) * 60 + currentMinute) * (HOUR_HEIGHT / 60)
    : -1;
  const nowTimeStr = format(now, 'HH:mm');

  // Filter and position appointments per day
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((app) => {
      const dateStr = app.startsAt || app.startTime;
      if (!dateStr) return false;
      const appDate = new Date(dateStr);
      return isSameDay(appDate, day);
    });
  };

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden shadow-sm flex flex-col">
      {/* Calendar Header Row */}
      <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-[#E6D8F1]/60 bg-white">
        {/* Timezone cell */}
        <div className="h-14 flex items-center justify-center border-r border-[#E6D8F1]/40 text-xs font-bold text-gray-400 select-none">
          IST
        </div>

        {/* 7 Days Columns */}
        {daysOfWeek.map((day, idx) => {
          const isToday = isSameDay(day, today);
          const dayName = format(day, 'EEE');
          const dayNum = format(day, 'dd');

          return (
            <div
              key={idx}
              className={`h-14 px-2 flex flex-col items-center justify-center border-r last:border-r-0 border-[#E6D8F1]/40 transition-colors select-none ${
                isToday ? 'bg-purple-50/80 font-bold' : ''
              }`}
            >
              <span
                className={`text-[11px] uppercase tracking-wider ${
                  isToday ? 'text-purple-600 font-bold' : 'text-gray-500'
                }`}
              >
                {dayName}
              </span>
              <span
                className={`text-base font-quicksand font-bold ${
                  isToday ? 'text-purple-700' : 'text-ink'
                }`}
              >
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* Grid Canvas */}
      <div className="relative overflow-x-auto min-h-[580px]">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500 animate-pulse">
            Loading appointments calendar...
          </div>
        ) : (
          <div className="grid grid-cols-[64px_repeat(7,1fr)] min-w-[700px]">
            {/* Left Hour Gutter */}
            <div className="border-r border-[#E6D8F1]/40 bg-[#F5EFFA]/20 select-none">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  className="relative text-[11px] text-gray-400 font-medium pr-2 text-right pt-1 border-b border-[#E6D8F1]/20"
                >
                  {String(hour).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* 7 Day Columns */}
            {daysOfWeek.map((day, dayIdx) => {
              const isToday = isSameDay(day, today);
              const isSunday = day.getDay() === 0;
              const dayAppointments = getAppointmentsForDay(day);

              return (
                <div
                  key={dayIdx}
                  className={`relative border-r last:border-r-0 border-[#E6D8F1]/40 min-h-[${
                    HOURS.length * HOUR_HEIGHT
                  }px] ${isToday ? 'bg-purple-50/20' : ''}`}
                >
                  {/* Horizontal Hour Grid Lines */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      className="border-b border-[#E6D8F1]/20 pointer-events-none"
                    />
                  ))}

                  {/* Empty Sunday message */}
                  {isSunday && dayAppointments.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                      <p className="text-xs text-gray-400 italic">
                        No sessions. A little room to rest.
                      </p>
                    </div>
                  )}

                  {/* Current-Time Line across today's column */}
                  {isToday && nowTopPx >= 0 && (
                    <div
                      style={{ top: `${nowTopPx}px` }}
                      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                    >
                      <div className="w-full h-[2px] bg-teal-500 shadow-sm" />
                      <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-teal-500" />
                      <span className="absolute -left-12 -top-2.5 bg-teal-700 text-white text-[10px] font-bold px-1 rounded">
                        {nowTimeStr}
                      </span>
                    </div>
                  )}

                  {/* Appointments Blocks */}
                  {dayAppointments.map((app) => {
                    const start = new Date(app.startsAt || app.startTime || '');
                    const end = new Date(app.endsAt || app.endTime || '');

                    const startHours = start.getHours() + start.getMinutes() / 60;
                    const durationHours = Math.max(0.5, (end.getTime() - start.getTime()) / (1000 * 60 * 60));

                    const topPx = Math.max(0, (startHours - 9) * HOUR_HEIGHT);
                    const heightPx = Math.max(48, durationHours * HOUR_HEIGHT - 4);

                    const isCancelled = app.status === AppointmentStatus.CANCELLED;
                    const clientName = app.client?.name || app.clientName || 'Client';
                    const therapistFirst = (app.therapist?.user?.name || app.therapistName || 'Staff').split(' ')[0];
                    const deptName = app.department?.code || (app.departmentName ? app.departmentName.split(' ')[0] : 'ST');
                    const timeRange = `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;

                    // Department colors
                    const isSpeech = deptName.toLowerCase().includes('speech') || deptName === 'ST';

                    let blockColors = isSpeech
                      ? 'bg-purple-100/90 border-purple-300 text-purple-900 hover:bg-purple-200'
                      : 'bg-teal-50 border-teal-300 text-teal-900 hover:bg-teal-100';

                    if (isCancelled) {
                      blockColors = 'bg-danger-bg/80 border-danger/30 text-danger hover:bg-danger-bg';
                    }

                    return (
                      <div
                        key={app.id}
                        onClick={() => onSelectAppointment(app)}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                        }}
                        className={`absolute left-1 right-1 z-10 p-2 rounded-btn border text-left cursor-pointer transition-all shadow-xs overflow-hidden flex flex-col justify-between ${blockColors}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`font-bold text-xs truncate ${
                                isCancelled ? 'line-through text-danger' : ''
                              }`}
                            >
                              {clientName}
                            </span>
                            {app.isConflict && (
                              <span title="Holiday / conflict notice" className="shrink-0">
                                <AlertTriangle className="w-3 h-3 text-warning" />
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] opacity-80 truncate">
                            {isCancelled ? (
                              <span className="font-semibold text-danger">Cancelled</span>
                            ) : (
                              <span>{deptName} · {therapistFirst}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-[10px] font-semibold opacity-70 mt-1 whitespace-nowrap">
                          {timeRange}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Text */}
      <div className="px-5 py-3 border-t border-[#E6D8F1]/40 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 font-medium">
        <span>Cancelled sessions remain visible. Select a session to see details or reschedule.</span>
        <span className="font-semibold text-purple-800">All times in IST</span>
      </div>
    </div>
  );
}
