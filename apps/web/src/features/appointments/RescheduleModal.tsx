'use client';

import React, { useState } from 'react';
import { Modal, DatePicker, Select, Button, useToast } from '@/components/ui';
import { ExtendedAppointment, appointmentsApi } from '@/lib/api/appointments';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: ExtendedAppointment | null;
  onSuccess: () => void;
}

const TIME_SLOTS = [
  '09:00', '09:45', '10:00', '10:30', '10:45', '11:15', '11:30',
  '12:00', '14:00', '14:45', '15:30', '16:00', '16:15', '17:00',
];

export function RescheduleModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: RescheduleModalProps) {
  const { showToast } = useToast();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (appointment) {
      const start = new Date(appointment.startsAt || appointment.startTime || '');
      if (!isNaN(start.getTime())) {
        setDate(start.toISOString().split('T')[0]);
        const hour = String(start.getHours()).padStart(2, '0');
        const min = String(start.getMinutes()).padStart(2, '0');
        setStartTime(`${hour}:${min}`);
      }
      setConflictError(null);
    }
  }, [appointment, isOpen]);

  if (!appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || isSubmitting) return;

    setIsSubmitting(true);
    setConflictError(null);

    const [h, m] = startTime.split(':').map(Number);
    const startsAtDate = new Date(date);
    startsAtDate.setHours(h, m, 0, 0);

    const endsAtDate = new Date(startsAtDate.getTime() + Number(durationMinutes) * 60 * 1000);

    try {
      await appointmentsApi.reschedule(appointment.id, {
        startsAt: startsAtDate.toISOString(),
        endsAt: endsAtDate.toISOString(),
      });

      showToast('Appointment rescheduled successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Schedule conflict detected for therapist or client slot.';
      setConflictError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeOptions = TIME_SLOTS.map((t) => ({ value: t, label: t }));
  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '60 minutes' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Appointment"
      maxWidth="max-w-[460px]"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
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
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-semibold"
          >
            {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {conflictError && (
          <div className="p-3 bg-danger-bg text-danger text-xs rounded-btn border border-danger/30 font-medium leading-relaxed">
            {conflictError}
          </div>
        )}

        <div className="p-3 bg-purple-50/50 rounded-btn border border-[#E6D8F1]/60 text-xs">
          <span className="font-semibold text-purple-800">Client:</span>{' '}
          <span className="text-ink font-medium">
            {appointment.client?.name || appointment.clientName}
          </span>
          <span className="text-gray-400 mx-2">·</span>
          <span className="font-semibold text-teal-700">Therapist:</span>{' '}
          <span className="text-ink font-medium">
            {appointment.therapist?.user?.name || appointment.therapistName}
          </span>
        </div>

        <DatePicker
          label="New Date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3.5">
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
            options={durationOptions}
          />
        </div>
      </form>
    </Modal>
  );
}
