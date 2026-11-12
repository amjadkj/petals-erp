'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StatusChip, Select } from '@/components/ui';
import { Calendar, FileText, ArrowUpRight } from 'lucide-react';

interface ChildOption {
  id: string;
  name: string;
}

interface UpcomingSessionItem {
  id: string;
  childName: string;
  therapistName: string;
  therapy: string;
  startsAt: string;
  endsAt: string;
  status: string;
}

interface ParentUpcomingWidgetProps {
  childrenList?: ChildOption[];
  sessions?: UpcomingSessionItem[];
}

const DEFAULT_CHILDREN: ChildOption[] = [
  { id: '1', name: 'Aadhya Nair' },
];

const DEFAULT_UPCOMING: UpcomingSessionItem[] = [
  { id: '1', childName: 'Aadhya Nair', therapistName: 'Dr. Ananya Sharma', therapy: 'Speech Therapy', startsAt: '2026-11-14T10:00:00Z', endsAt: '2026-11-14T10:45:00Z', status: 'scheduled' },
  { id: '2', childName: 'Aadhya Nair', therapistName: 'Rajesh Menon', therapy: 'Occupational Therapy', startsAt: '2026-11-16T11:00:00Z', endsAt: '2026-11-16T11:45:00Z', status: 'scheduled' },
];

export function ParentUpcomingWidget({
  childrenList = DEFAULT_CHILDREN,
  sessions = DEFAULT_UPCOMING,
}: ParentUpcomingWidgetProps) {
  const [selectedChildId, setSelectedChildId] = useState(childrenList[0]?.id || '');

  const filteredSessions = sessions.filter(
    (s) => !selectedChildId || s.childName === childrenList.find((c) => c.id === selectedChildId)?.name,
  );

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 flex flex-col justify-between h-full space-y-4">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E6D8F1]/40 mb-3">
          <div>
            <h3 className="font-quicksand font-bold text-base text-ink">
              Upcoming Therapy Sessions
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Care schedule & shared clinic documentation
            </p>
          </div>

          {childrenList.length > 1 && (
            <div className="w-48">
              <Select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                options={childrenList.map((c) => ({ value: c.id, label: c.name }))}
              />
            </div>
          )}
        </div>

        {filteredSessions.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No upcoming sessions scheduled right now.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSessions.map((session) => {
              const dateStr = new Date(session.startsAt).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });
              const timeStr = new Date(session.startsAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={session.id}
                  className="p-3 bg-teal-50/40 rounded-btn border border-teal-200/50 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-sm text-ink">
                      {session.therapy}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      With {session.therapistName}
                    </div>
                    <div className="text-xs text-teal-700 font-medium flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr} at {timeStr}</span>
                    </div>
                  </div>
                  <div>
                    <StatusChip status={session.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#E6D8F1]/40 flex items-center justify-between text-xs font-semibold">
        <Link
          href="/reports"
          className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Shared clinical reports</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
        <span className="text-gray-400">Payment status: <span className="text-success font-bold">Paid</span></span>
      </div>
    </div>
  );
}
