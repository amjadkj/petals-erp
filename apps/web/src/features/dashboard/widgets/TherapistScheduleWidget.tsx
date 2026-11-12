'use client';

import React from 'react';
import Link from 'next/link';
import { StatusChip } from '@/components/ui';
import { ArrowUpRight, Calendar, User } from 'lucide-react';

interface TherapistSessionItem {
  id: string;
  clientId: string;
  clientName: string;
  clientCode?: string;
  startsAt: string;
  endsAt: string;
  status: string;
}

interface TherapistScheduleWidgetProps {
  sessions?: TherapistSessionItem[];
}

const DEFAULT_THERAPIST_SESSIONS: TherapistSessionItem[] = [
  { id: '1', clientId: 'c1', clientName: 'Aadhya Nair', clientCode: 'PN-001', startsAt: '2026-11-12T09:00:00Z', endsAt: '2026-11-12T09:45:00Z', status: 'attended' },
  { id: '2', clientId: 'c2', clientName: 'Vihaan Sharma', clientCode: 'PN-004', startsAt: '2026-11-12T10:30:00Z', endsAt: '2026-11-12T11:15:00Z', status: 'scheduled' },
  { id: '3', clientId: 'c3', clientName: 'Diya Patel', clientCode: 'PN-018', startsAt: '2026-11-12T14:00:00Z', endsAt: '2026-11-12T14:45:00Z', status: 'scheduled' },
];

export function TherapistScheduleWidget({ sessions = DEFAULT_THERAPIST_SESSIONS }: TherapistScheduleWidgetProps) {
  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#E6D8F1]/40 mb-3">
          <div>
            <h3 className="font-quicksand font-bold text-base text-ink">
              My Schedule Today
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Assigned sessions for your clinical caseload
            </p>
          </div>
          <Link
            href="/appointments"
            className="text-xs md:text-sm font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
          >
            <span>Calendar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No sessions scheduled for you today.
          </div>
        ) : (
          <div className="space-y-2.5">
            {sessions.map((s) => {
              const start = new Date(s.startsAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const end = new Date(s.endsAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <Link
                  key={s.id}
                  href={`/clients/${s.clientId}`}
                  className="p-3 bg-purple-50/40 hover:bg-purple-100/50 rounded-btn border border-[#E6D8F1]/50 flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-ink group-hover:text-purple-600 transition-colors">
                        {s.clientName}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-purple-600" />
                        <span>{start} - {end}</span>
                        {s.clientCode && <span>· {s.clientCode}</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <StatusChip status={s.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
