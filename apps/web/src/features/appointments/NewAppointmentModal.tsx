'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Modal, Input, Select, DatePicker, Button, useToast } from '@/components/ui';
import { appointmentsApi } from '@/lib/api/appointments';
import { usePermissionsStore } from '@/lib/permissions/store';
import { Repeat } from 'lucide-react';
import { CLINIC_SCHEDULE_SLOTS } from './types';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: Array<{ id: string; name: string; clientCode?: string }>;
  therapists: Array<{ id: string; name: string; departmentId?: string | null }>;
  departments?: Array<{ id: string; name: string }>;
  prefilledClientId?: string;
  prefilledTherapistId?: string;
  prefilledTime?: string;
  prefilledDate?: string;
}

const TIME_SLOTS = CLINIC_SCHEDULE_SLOTS.map((s) => s.startTime);
const DEFAULT_DURATION_MINUTES = 45;

export function NewAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  clients = [],
  therapists = [],
  departments = [],
  prefilledClientId,
  prefilledTherapistId,
  prefilledTime,
  prefilledDate,
}: NewAppointmentModalProps) {
  const { showToast } = useToast();
  const { selectedBranchId } = usePermissionsStore();

  const [clientId, setClientId] = useState(prefilledClientId || clients[0]?.id || '');
  const [therapistId, setTherapistId] = useState(prefilledTherapistId || therapists[0]?.id || '');
  const [date, setDate] = useState(prefilledDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(prefilledTime || '10:00');
  const [clientSearch, setClientSearch] = useState('');
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (prefilledClientId) setClientId(prefilledClientId);
      else if (clients.length > 0 && !clientId) setClientId(clients[0].id);

      if (prefilledTherapistId) {
        setTherapistId(prefilledTherapistId);
      } else if (therapists.length > 0 && !therapistId) {
        setTherapistId(therapists[0].id);
      }

      if (prefilledTime) {
        setStartTime(prefilledTime);
      } else if (!startTime) {
        setStartTime('10:00');
      }

      if (prefilledDate) {
        setDate(prefilledDate);
      } else if (!date) {
        setDate(new Date().toISOString().split('T')[0]);
      }

      setConflictError(null);
    }
  }, [
    isOpen,
    prefilledClientId,
    prefilledTherapistId,
    prefilledTime,
    prefilledDate,
    clients,
    therapists,
  ]);

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

    const endsAtDate = new Date(startsAtDate.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000);

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
  const timeOptions = TIME_SLOTS.map((t) => ({ value: t, label: t }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Appointment"
      maxWidth="max-w-[500px]"
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

        {/* Assigned Therapist */}
        <Select
          label="Assigned Therapist"
          required
          value={therapistId}
          onChange={(e) => setTherapistId(e.target.value)}
          options={therapistOptions}
        />

        {/* Date & Start Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
        </div>
      </form>
    </Modal>
  );
}
