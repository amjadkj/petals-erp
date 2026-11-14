'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusChip } from '@/components/ui/StatusChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateSafe } from '@/lib/formatters';
import { appointmentsApi } from '@/lib/api/appointments';
import { Calendar } from 'lucide-react';

interface SessionItem {
  id: string;
  clientName: string;
  date: string;
  timeSlot: string;
  sessionType: string;
  room: string;
  status: string;
}

export function SessionsConductedTab({ employeeId }: { employeeId: string }) {
  const { data: res, isLoading } = useQuery({
    queryKey: ['employee-sessions', employeeId],
    queryFn: () => appointmentsApi.getAppointments({ therapistId: employeeId }),
    enabled: !!employeeId,
  });

  const sessions: SessionItem[] = useMemo(() => {
    if (!res?.data || res.data.length === 0) return [];
    return res.data.map((appt) => {
      const start = appt.startsAt ? new Date(appt.startsAt) : null;
      const end = appt.endsAt ? new Date(appt.endsAt) : null;
      const timeSlot =
        start && end
          ? `${start.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })} – ${end.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}`
          : appt.startTime || 'Scheduled';

      return {
        id: appt.id,
        clientName: appt.client?.name || appt.clientName || 'Client',
        date: appt.startsAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        timeSlot,
        sessionType: appt.department?.name || 'Therapy Session',
        room: appt.roomName || 'Therapy Room',
        status: (appt.status || 'SCHEDULED').toLowerCase(),
      };
    });
  }, [res]);

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
          Recorded appointments and conducted clinical therapy sessions
        </p>
      </div>

      {sessions.length > 0 ? (
        <DataTable
          columns={columns}
          data={sessions}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
        />
      ) : (
        <EmptyState
          icon={<Calendar className="w-8 h-8 text-purple-600 stroke-[1.5]" />}
          headline="No Sessions Recorded"
          hint="No appointment sessions have been scheduled or completed for this clinician yet."
        />
      )}
    </div>
  );
}
