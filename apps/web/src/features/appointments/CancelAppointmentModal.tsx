'use client';

import React, { useState } from 'react';
import { Modal, Button, useToast } from '@/components/ui';
import { ExtendedAppointment, appointmentsApi } from '@/lib/api/appointments';
import { AlertCircle } from 'lucide-react';

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: ExtendedAppointment | null;
  onSuccess: () => void;
}

export function CancelAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: CancelAppointmentModalProps) {
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setReason('');
  }, [appointment, isOpen]);

  if (!appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await appointmentsApi.cancel(appointment.id, reason.trim());
      showToast('Appointment cancelled and parent notified.', 'info');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to cancel appointment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Appointment"
      maxWidth="max-w-[460px]"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 px-3 text-xs"
          >
            Keep appointment
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="h-9 px-4 text-xs font-semibold border-danger/30 text-danger hover:bg-danger-bg"
          >
            {isSubmitting ? 'Cancelling...' : 'Confirm cancellation'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 bg-danger-bg/50 border border-danger/20 rounded-card flex items-start gap-2.5 text-xs text-danger">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Parent will be notified immediately.</span>
            <p className="mt-0.5 text-gray-700">
              This session will remain visibly struck-through on the clinic calendar for audit tracking.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-ink">
            Reason for cancellation <span className="text-danger">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Client unwell with viral fever, requested rescheduling next week..."
            className="w-full text-ink text-sm rounded-btn border border-[#D9D4DE] p-3 focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger-bg"
          />
        </div>
      </form>
    </Modal>
  );
}
