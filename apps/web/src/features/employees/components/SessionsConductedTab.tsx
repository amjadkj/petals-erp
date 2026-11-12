'use client';

import React from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusChip } from '@/components/ui/StatusChip';
import { formatDateSafe } from '@/lib/formatters';

interface SessionItem {
  id: string;
  clientName: string;
  date: string;
  timeSlot: string;
  sessionType: string;
  room: string;
  status: string;
}

const mockSessions: SessionItem[] = [
  { id: 's-1', clientName: 'Aarav Sharma', date: '2026-11-12', timeSlot: '10:00 AM – 10:45 AM', sessionType: 'Individual Speech Therapy', room: 'Speech Lab A', status: 'attended' },
  { id: 's-2', clientName: 'Diya Patel', date: '2026-11-12', timeSlot: '11:15 AM – 12:00 PM', sessionType: 'Language Acquisition', room: 'Speech Lab A', status: 'attended' },
  { id: 's-3', clientName: 'Kabir Verma', date: '2026-11-12', timeSlot: '02:00 PM – 02:45 PM', sessionType: 'Articulation Drill', room: 'Speech Lab B', status: 'scheduled' },
  { id: 's-4', clientName: 'Vihaan Joshi', date: '2026-11-11', timeSlot: '03:30 PM – 04:15 PM', sessionType: 'Parent Coaching Session', room: 'Consult Room 1', status: 'attended' },
  { id: 's-5', clientName: 'Ananya Iyer', date: '2026-11-10', timeSlot: '09:15 AM – 10:00 AM', sessionType: 'Initial Intake Evaluation', room: 'Diagnostic Suite', status: 'attended' },
];

export function SessionsConductedTab({ employeeId: _employeeId }: { employeeId: string }) {
  const columns: Column<SessionItem>[] = [
    {
      key: 'clientName',
      header: 'Client',
      isTitle: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-ink">{row.clientName}</span>
          <span className="block text-xs text-gray-500">{row.sessionType}</span>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      isSecondary: true,
      render: (row) => <span className="text-gray-700 text-sm">{formatDateSafe(row.date)}</span>,
    },
    {
      key: 'timeSlot',
      header: 'Time',
      isSecondary: true,
      render: (row) => <span className="text-gray-600 text-sm">{row.timeSlot}</span>,
    },
    {
      key: 'room',
      header: 'Therapy Room',
      render: (row) => <span className="text-gray-600 text-sm">{row.room}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      isStatus: true,
      render: (row) => <StatusChip status={row.status} />,
    },
  ];

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-3">
      <div className="pb-2 border-b border-[#E6D8F1]/50">
        <h3 className="font-quicksand font-bold text-lg text-purple-600">
          Sessions Conducted
        </h3>
        <p className="text-xs text-gray-500">
          Recent and upcoming scheduled appointments for this clinician
        </p>
      </div>

      <DataTable
        columns={columns}
        data={mockSessions}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
