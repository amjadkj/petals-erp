'use client';

import React from 'react';
import { StatusChip } from '@/components/ui';
import { Calendar, Clock, User, CheckCircle2 } from 'lucide-react';

interface SessionRecord {
  id: string;
  startsAt: string;
  endsAt: string;
  therapistName: string;
  status: string;
  notes?: string;
  linkedGoal?: string;
}

interface SessionsTabProps {
  clientId: string;
}

const DEFAULT_SESSIONS: SessionRecord[] = [
  {
    id: 's1',
    startsAt: '2026-11-10T10:00:00Z',
    endsAt: '2026-11-10T10:45:00Z',
    therapistName: 'Dr. Ananya Sharma',
    status: 'ATTENDED',
    notes: 'Focused on expressive phrase combinations. High engagement with animal figurines.',
    linkedGoal: 'Expressive Language · Combine noun + verb',
  },
  {
    id: 's2',
    startsAt: '2026-11-08T11:00:00Z',
    endsAt: '2026-11-08T11:45:00Z',
    therapistName: 'Rajesh Menon',
    status: 'ATTENDED',
    notes: 'Bead threading drill. Maintained focus for 12 minutes before sensory fatigue.',
    linkedGoal: 'Bilateral Coordination · 5-piece bead threading',
  },
  {
    id: 's3',
    startsAt: '2026-11-03T10:00:00Z',
    endsAt: '2026-11-03T10:45:00Z',
    therapistName: 'Dr. Ananya Sharma',
    status: 'ATTENDED',
    notes: 'Introductory flashcard evaluation. Practised spontaneous requesting.',
    linkedGoal: 'Expressive Language',
  },
  {
    id: 's4',
    startsAt: '2026-10-27T10:00:00Z',
    endsAt: '2026-10-27T10:45:00Z',
    therapistName: 'Dr. Ananya Sharma',
    status: 'CANCELLED',
    notes: 'Parent notified in advance due to mild fever.',
  },
];

export function SessionsTab({ clientId: _clientId }: SessionsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-quicksand font-bold text-lg text-ink">
            Therapy Session History
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Attendance record, clinical session notes, and linked IEP goals
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden">
        <div className="divide-y divide-[#E6D8F1]/30">
          {DEFAULT_SESSIONS.map((session) => {
            const dateStr = new Date(session.startsAt).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const timeStr = `${new Date(session.startsAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })} - ${new Date(session.endsAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}`;

            return (
              <div
                key={session.id}
                className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-purple-50/20 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span>{dateStr}</span>
                    </span>

                    <span className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{timeStr}</span>
                    </span>

                    <span className="flex items-center gap-1.5 text-xs text-gray-600">
                      <User className="w-3.5 h-3.5 text-teal-700" />
                      <span>{session.therapistName}</span>
                    </span>
                  </div>

                  {session.notes && (
                    <p className="text-sm text-gray-700 pt-1 leading-relaxed">
                      {session.notes}
                    </p>
                  )}

                  {session.linkedGoal && (
                    <div className="flex items-center gap-1.5 text-xs text-teal-700 font-medium pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Linked Goal: {session.linkedGoal}</span>
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  <StatusChip status={session.status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
