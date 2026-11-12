'use client';

import React, { useState } from 'react';
import { Button, Checkbox, useToast } from '@/components/ui';
import { FlaggedSessionItem } from '../types';
import { AlertTriangle, Calendar, Clock, RotateCcw, XCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface NeedsAttentionTabProps {
  sessions?: FlaggedSessionItem[];
  onRefresh: () => void;
}

const DEFAULT_FLAGGED_SESSIONS: FlaggedSessionItem[] = [
  {
    id: 'f1',
    appointmentId: 'a-f1',
    clientName: 'Aadhya Nair',
    therapistName: 'Kavitha Sundaram',
    departmentName: 'Behavioural Therapy',
    startsAt: '2026-11-14T10:00:00Z',
    endsAt: '2026-11-14T10:45:00Z',
    reason: 'STAFF_LEAVE',
    reasonLabel: 'Therapist on Approved Sick Leave',
    therapistLeaveNote: 'Doctor appointment & medical rest',
  },
  {
    id: 'f2',
    appointmentId: 'a-f2',
    clientName: 'Vihaan Sharma',
    therapistName: 'Kavitha Sundaram',
    departmentName: 'Behavioural Therapy',
    startsAt: '2026-11-14T11:15:00Z',
    endsAt: '2026-11-14T12:00:00Z',
    reason: 'STAFF_LEAVE',
    reasonLabel: 'Therapist on Approved Sick Leave',
  },
  {
    id: 'f3',
    appointmentId: 'a-f3',
    clientName: 'Rohan Sen',
    therapistName: 'Rajesh Menon',
    departmentName: 'Occupational Therapy',
    startsAt: '2026-11-17T09:00:00Z',
    endsAt: '2026-11-17T09:45:00Z',
    reason: 'PUBLIC_HOLIDAY',
    reasonLabel: 'Clinic Closed for State Holiday',
  },
];

export function NeedsAttentionTab({
  sessions = DEFAULT_FLAGGED_SESSIONS,
  onRefresh,
}: NeedsAttentionTabProps) {
  const { showToast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  const activeSessions = sessions.filter((s) => !resolvedIds.includes(s.id));

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? activeSessions.map((s) => s.id) : []);
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleRescheduleSingle = (session: FlaggedSessionItem) => {
    setResolvedIds((prev) => [...prev, session.id]);
    showToast(`Slot for ${session.clientName} moved to substitute therapist.`, 'success');
  };

  const handleCancelSingle = (session: FlaggedSessionItem) => {
    if (!window.confirm(`Cancel session for ${session.clientName}? Parent will be notified.`)) return;
    setResolvedIds((prev) => [...prev, session.id]);
    showToast(`Session for ${session.clientName} cancelled with leave reason.`, 'info');
  };

  const handleBulkReschedule = () => {
    if (selectedIds.length === 0) return;
    setResolvedIds((prev) => [...prev, ...selectedIds]);
    showToast(`Bulk rescheduled ${selectedIds.length} affected session(s).`, 'success');
    setSelectedIds([]);
  };

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden space-y-4 p-5">
      {/* Header and Bulk Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6D8F1]/40">
        <div>
          <h3 className="font-quicksand font-bold text-base text-ink">
            Sessions Flagged by Leave & Holidays
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Resolve conflicts before families arrive at the centre
          </p>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={handleBulkReschedule}
              className="h-9 px-3.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Bulk Reschedule ({selectedIds.length})</span>
            </Button>
          </div>
        )}
      </div>

      {activeSessions.length === 0 ? (
        <div className="py-14 text-center text-sm text-gray-500 space-y-2">
          <div className="w-12 h-12 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="font-semibold text-ink">All clear!</div>
          <p className="text-xs text-gray-400">
            No sessions are currently impacted by staff leaves or public holidays.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select all bar */}
          <div className="p-3 bg-purple-50/50 rounded-btn flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.length === activeSessions.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                id="select-all-flagged"
              />
              <label htmlFor="select-all-flagged" className="font-semibold text-purple-900 cursor-pointer">
                Select all flagged sessions
              </label>
            </div>
            <span className="text-gray-500">
              {activeSessions.length} session{activeSessions.length === 1 ? '' : 's'} require resolution
            </span>
          </div>

          {/* Cards List */}
          <div className="divide-y divide-[#E6D8F1]/40">
            {activeSessions.map((session) => {
              const start = new Date(session.startsAt);
              const end = new Date(session.endsAt);
              const dateStr = format(start, 'EEE, dd MMM yyyy');
              const timeStr = `${format(start, 'hh:mm a')} – ${format(end, 'hh:mm a')}`;
              const isSelected = selectedIds.includes(session.id);

              return (
                <div
                  key={session.id}
                  className={`py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isSelected ? 'bg-purple-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleRow(session.id)}
                      className="mt-1"
                    />

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-ink">
                          {session.clientName}
                        </span>
                        <span className="text-xs text-danger font-semibold bg-danger-bg px-2 py-0.5 rounded border border-danger/20 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{session.reasonLabel}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-purple-800 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-purple-600" />
                          <span>{dateStr}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{timeStr}</span>
                        </span>
                        <span>·</span>
                        <span>Therapist: <strong className="text-ink">{session.therapistName}</strong></span>
                        <span>·</span>
                        <span>{session.departmentName}</span>
                      </div>

                      {session.therapistLeaveNote && (
                        <p className="text-xs text-gray-600 italic mt-1 bg-amber-50/60 p-2 rounded border border-amber-100">
                          Leave Note: "{session.therapistLeaveNote}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRescheduleSingle(session)}
                      className="h-8 px-3 text-xs flex items-center gap-1 border-purple-200 text-purple-800 hover:bg-purple-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reschedule</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCancelSingle(session)}
                      className="h-8 px-3 text-xs flex items-center gap-1 border-danger/30 text-danger hover:bg-danger-bg"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
