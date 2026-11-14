'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Modal, Input, Select, DatePicker, Button, useToast } from '@/components/ui';
import { appointmentsApi } from '@/lib/api/appointments';
import { usePermissionsStore } from '@/lib/permissions/store';
import { Repeat } from 'lucide-react';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: Array<{ id: string; name: string; clientCode?: string }>;
  therapists: Array<{ id: string; name: string; departmentId?: string | null }>;
  departments: Array<{ id: string; name: string }>;
  prefilledClientId?: string;
}

const TIME_SLOTS = [
  '08:30', '09:15', '10:00', '10:45', '11:30', '12:30',
  '14:00', '14:45', '15:30', '16:30',
];

export function NewAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  clients = [],
  therapists = [],
  departments = [],
  prefilledClientId,
}: NewAppointmentModalProps) {
  const { showToast } = useToast();
  const { selectedBranchId } = usePermissionsStore();

  const [clientId, setClientId] = useState(prefilledClientId || clients[0]?.id || '');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [therapistId, setTherapistId] = useState(therapists[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [roomId, setRoomId] = useState('r1');
  const [clientSearch, setClientSearch] = useState('');
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (prefilledClientId) setClientId(prefilledClientId);
    else if (clients.length > 0 && !clientId) setClientId(clients[0].id);

    if (departments.length > 0 && !departmentId) setDepartmentId(departments[0].id);
    if (therapists.length > 0 && !therapistId) setTherapistId(therapists[0].id);
    setConflictError(null);
  }, [prefilledClientId, clients, departments, therapists, isOpen]);

  const filteredClients = clients.filter(
    (c) =>
      !clientSearch ||
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.clientCode && c.clientCode.toLowerCase().includes(clientSearch.toLowerCase())),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !therapistId || !date || !startTime || isSubmitting) return;

    setIsSubmitting(true);
    setConflictError(null);

    const [h, m] = startTime.split(':').map(Number);
    const startsAtDate = new Date(date);
    startsAtDate.setHours(h, m, 0, 0);

    const endsAtDate = new Date(startsAtDate.getTime() + Number(durationMinutes) * 60 * 1000);

    const branchId =
      selectedBranchId && selectedBranchId !== 'ALL'
        ? selectedBranchId
        : 'b1';

    try {
      await appointmentsApi.createAppointment({
        branchId,
        clientId,
        therapistId,
        startsAt: startsAtDate.toISOString(),
        endsAt: endsAtDate.toISOString(),
        // roomId: roomId || undefined,
      });

      showToast('Appointment booked successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Schedule conflict: therapist or client is already booked at this time.';
      setConflictError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientOptions = filteredClients.map((c) => ({
    value: c.id,
    label: `${c.name} ${c.clientCode ? `(${c.clientCode})` : ''}`,
  }));

  const therapistOptions = therapists.map((t) => ({ value: t.id, label: t.name }));
  const deptOptions = departments.map((d) => ({ value: d.id, label: d.name }));
  const timeOptions = TIME_SLOTS.map((t) => ({ value: t, label: t }));

  const roomOptions = [
    { value: 'r1', label: 'Therapy Room 1 (Speech)' },
    { value: 'r2', label: 'Therapy Room 2 (Sensory Gym)' },
    { value: 'r3', label: 'Therapy Room 3 (OT Fine Motor)' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Appointment"
      maxWidth="max-w-[540px]"
      footer={
        <div className="flex items-center justify-between w-full">
          <Link
            href="/schedule-planning"
            onClick={onClose}
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Need recurring? Go to Schedule planning</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-3 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={!clientId || !therapistId || isSubmitting}
              className="h-9 px-4 text-xs font-semibold"
            >
              {isSubmitting ? 'Creating...' : 'Create appointment'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {conflictError && (
          <div className="p-3 bg-danger-bg text-danger text-xs rounded-btn border border-danger/30 font-medium">
            {conflictError}
          </div>
        )}

        {/* Client Search & Select */}
        <div className="space-y-1.5">
          <Input
            label="Search Client"
            placeholder="Type name or client code..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
          />
          <Select
            label="Select Client"
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            options={clientOptions}
          />
        </div>

        {/* Department & Therapist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            label="Department"
            required
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={deptOptions}
          />

          <Select
            label="Assigned Therapist"
            required
            value={therapistId}
            onChange={(e) => setTherapistId(e.target.value)}
            options={therapistOptions}
          />
        </div>

        {/* Date, Start Time & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <DatePicker
            label="Date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Select
            label="Start Time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            options={timeOptions}
          />

          <Select
            label="Duration"
            required
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            options={[
              { value: '30', label: '30 min' },
              { value: '45', label: '45 min' },
              { value: '60', label: '60 min' },
            ]}
          />
        </div>

        {/* Room Allocation */}
        {/* <Select
          label="Clinical Room"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          options={roomOptions}
        /> */}
      </form>
    </Modal>
  );
}
