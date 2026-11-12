'use client';

import React from 'react';
import type { ActivityLogEntry } from '../types';

interface ActivityLogTabProps {
  employeeId: string;
}

const mockFullActivityLog: ActivityLogEntry[] = [
  { id: 'act-1', timestamp: '12 Nov 2026 · 11:30 AM', action: 'Session Note Filed', clientName: 'Aarav Sharma', detail: 'Completed speech articulation trial; logged 12 trials with 85% success.' },
  { id: 'act-2', timestamp: '11 Nov 2026 · 04:15 PM', action: 'Diagnostic Report Shared', clientName: 'Diya Patel', detail: 'Uploaded diagnostic assessment PDF for caregiver portal review.' },
  { id: 'act-3', timestamp: '10 Nov 2026 · 02:00 PM', action: 'Goal Re-calibrated', clientName: 'Kabir Verma', detail: 'Adjusted subgoal to include tactile card prompts during session.' },
  { id: 'act-4', timestamp: '09 Nov 2026 · 10:00 AM', action: 'Attendance Check-in', detail: 'Biometric badge verified at Indiranagar Front Desk (08:58 AM).' },
  { id: 'act-5', timestamp: '07 Nov 2026 · 03:45 PM', action: 'Caregiver Consultation Logged', clientName: 'Vihaan Joshi', detail: '15-minute phone consultation with father regarding home practice.' },
];

export function ActivityLogTab({ employeeId: _employeeId }: ActivityLogTabProps) {
  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
      <div className="pb-2 border-b border-[#E6D8F1]/50">
        <h3 className="font-quicksand font-bold text-lg text-purple-600">
          Activity Audit Log
        </h3>
        <p className="text-xs text-gray-500">
          Comprehensive historical log of clinical records and system events
        </p>
      </div>

      <div className="space-y-4 pl-2">
        {mockFullActivityLog.map((act) => (
          <div key={act.id} className="border-l-2 border-purple-200 pl-4 py-1 text-sm space-y-1">
            <div className="text-xs text-gray-400 font-medium">{act.timestamp}</div>
            <div className="font-semibold text-ink">
              {act.action} {act.clientName && <span className="text-purple-600 font-normal">· {act.clientName}</span>}
            </div>
            <div className="text-xs text-gray-600">{act.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
