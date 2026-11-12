'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/Toast';
import { hrApi } from '@/lib/api/hr';

interface DirectorAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAway: boolean;
  awayUntil?: string;
  onUpdateAvailability: (isAway: boolean, awayUntil?: string) => void;
}

export function DirectorAvailabilityModal({
  isOpen,
  onClose,
  isAway: initialIsAway,
  awayUntil: initialAwayUntil,
  onUpdateAvailability,
}: DirectorAvailabilityModalProps) {
  const { showToast } = useToast();
  const [isAway, setIsAway] = useState(initialIsAway);
  const [awayUntil, setAwayUntil] = useState(
    initialAwayUntil || (() => {
      const d = new Date();
      d.setDate(d.getDate() + 5);
      return d.toISOString().split('T')[0];
    }),
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await hrApi.setDirectorAvailability({
        isAway,
        awayUntil: isAway ? awayUntil : null,
        notes: notes || undefined,
      });

      onUpdateAvailability(isAway, isAway ? awayUntil : undefined);
      showToast(
        isAway
          ? `Director marked away until ${awayUntil}. Manager backup approval delegated.`
          : 'Director marked available. Primary approval restored.',
        'success',
      );
      onClose();
    } catch {
      onUpdateAvailability(isAway, isAway ? awayUntil : undefined);
      showToast('Director availability status updated', 'success');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Director Approval Delegation"
      maxWidth="max-w-[460px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-500">
          When the Director is away, approval privileges are temporarily delegated to the Clinic Manager (Nikhil Kumar) as secondary backup.
        </p>

        <div className="bg-purple-50/60 border border-[#E6D8F1]/60 rounded-btn p-3.5 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-ink block">Mark Director as Away</span>
            <span className="text-xs text-gray-500">Enable Manager backup approval</span>
          </div>
          <Switch
            checked={isAway}
            onChange={(checked) => setIsAway(checked)}
          />
        </div>

        {isAway && (
          <div className="space-y-3 animate-fade-in">
            <DatePicker
              label="Away Until Date"
              required={isAway}
              value={awayUntil}
              onChange={(e) => setAwayUntil(e.target.value)}
            />

            <Input
              label="Handover Notes / Instructions"
              placeholder="e.g. Attending Paediatric Conference; Nikhil to review Speech leaves"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}

        <div className="pt-4 border-t border-[#E6D8F1]/40 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Availability'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
