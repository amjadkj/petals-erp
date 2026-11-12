'use client';

import React from 'react';
import { format, isSameDay } from 'date-fns';
import { ExtendedAppointment } from '@/lib/api/appointments';
import { StatusChip } from '@/components/ui';

interface MobileAgendaViewProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  daysOfWeek: Date[];
  appointments: ExtendedAppointment[];
  onSelectAppointment: (app: ExtendedAppointment) => void;
}

export function MobileAgendaView({
  currentDate,
  onSelectDate,
  daysOfWeek,
  appointments,
  onSelectAppointment,
}: MobileAgendaViewProps) {
  // Check which days have sessions
  const hasSessionOnDay = (day: Date) => {
    return appointments.some((app) => {
      const dateStr = app.startsAt || app.startTime;
      return dateStr && isSameDay(new Date(dateStr), day);
    });
  };

  // Sessions for the currently selected day
  const currentDaySessions = appointments.filter((app) => {
    const dateStr = app.startsAt || app.startTime;
    return dateStr && isSameDay(new Date(dateStr), currentDate);
  });

  return (
    <div className="space-y-4">
      {/* Horizontal Week Strip */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-3 shadow-sm">
        <div className="flex items-center justify-between gap-1 overflow-x-auto">
          {daysOfWeek.map((day, idx) => {
            const isSelected = isSameDay(day, currentDate);
            const hasDots = hasSessionOnDay(day);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectDate(day)}
                className={`flex-1 min-w-[42px] py-2 px-1 rounded-btn flex flex-col items-center justify-center transition-colors select-none ${
                  isSelected
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'hover:bg-purple-50 text-ink'
                }`}
              >
                <span className={`text-[10px] uppercase ${isSelected ? 'text-purple-100' : 'text-gray-500'}`}>
                  {format(day, 'EEE')}
                </span>
                <span className="text-sm font-bold font-quicksand mt-0.5">
                  {format(day, 'dd')}
                </span>
                <div className="h-1.5 mt-1 flex items-center justify-center">
                  {hasDots && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-teal-300' : 'bg-purple-600'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Sessions Vertical List */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-4 space-y-3">
        <div className="pb-2 border-b border-[#E6D8F1]/40 flex items-center justify-between">
          <h3 className="font-quicksand font-bold text-base text-ink">
            {format(currentDate, 'EEEE, dd MMMM')}
          </h3>
          <span className="text-xs font-semibold text-gray-500">
            {currentDaySessions.length} session{currentDaySessions.length === 1 ? '' : 's'}
          </span>
        </div>

        {currentDaySessions.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400 italic">
            No sessions scheduled for this day.
          </div>
        ) : (
          <div className="space-y-2.5">
            {currentDaySessions.map((app) => {
              const start = new Date(app.startsAt || app.startTime || '');
              const end = new Date(app.endsAt || app.endTime || '');
              const timeStr = `${format(start, 'hh:mm a')} – ${format(end, 'hh:mm a')}`;
              const clientName = app.client?.name || app.clientName || 'Client';
              const therapistName = app.therapist?.user?.name || app.therapistName || 'Staff';
              const deptName = app.department?.name || app.departmentName || 'Therapy';

              return (
                <div
                  key={app.id}
                  onClick={() => onSelectAppointment(app)}
                  className="p-3.5 bg-purple-50/30 rounded-btn border border-[#E6D8F1]/40 flex items-center justify-between gap-3 active:bg-purple-100/50 transition-colors cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-bold text-purple-800">
                      {timeStr}
                    </span>
                    <div className="font-bold text-sm text-ink mt-0.5">
                      {clientName}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {deptName} · {therapistName}
                    </div>
                  </div>

                  <div>
                    <StatusChip status={app.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
