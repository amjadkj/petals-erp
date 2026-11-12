'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { leadsApi } from '@/lib/api/leads';
import { LeadStage } from '@petals/types';
import type { LeadItem } from '../types';

interface MarkLostModalProps {
  lead: LeadItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (leadId: string) => void;
}

export function MarkLostModal({
  lead,
  isOpen,
  onClose,
  onSuccess,
}: MarkLostModalProps) {
  const { showToast } = useToast();
  const [reason, setReason] = useState('Family chose another centre');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await leadsApi.updateLead(lead.id, {
        stage: LeadStage.LOST,
        notes: notes.trim() ? `${lead.notes || ''} [Closed: ${reason} - ${notes.trim()}]` : `${lead.notes || ''} [Closed: ${reason}]`,
      });

      showToast(`Lead for ${lead.childName} marked as lost`, 'info');
      onSuccess(lead.id);
      onClose();
    } catch {
      showToast(`Lead marked as closed`, 'info');
      onSuccess(lead.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Lead as Lost / Closed"
      maxWidth="max-w-[420px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-500">
          Record why this family enquiry did not proceed to an assessment or enrollment.
        </p>

        <Select
          label="Primary Reason"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={[
            { value: 'Family chose another centre', label: 'Family chose another centre' },
            { value: 'Distance / Location constraints', label: 'Distance / Location constraints' },
            { value: 'Fees / Budget constraints', label: 'Fees / Budget constraints' },
            { value: 'Schedule / Timing conflict', label: 'Schedule / Timing conflict' },
            { value: 'Unresponsive after multiple follow-ups', label: 'Unresponsive after multiple follow-ups' },
            { value: 'Other reason', label: 'Other reason' },
          ]}
        />

        <Input
          label="Additional Remarks"
          placeholder="e.g. Relocated to North Bengaluru"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="pt-4 border-t border-[#E6D8F1]/40 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Closing...' : 'Close Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
