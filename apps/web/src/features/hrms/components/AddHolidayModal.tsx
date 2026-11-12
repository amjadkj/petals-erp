'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/Toast';
import { hrApi } from '@/lib/api/hr';
import type { HolidayItem } from '../types';

interface AddHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (holiday: HolidayItem) => void;
  branches?: { id: string; name: string }[];
}

export function AddHolidayModal({
  isOpen,
  onClose,
  onSuccess,
  branches = [
    { id: 'all', name: 'All branches (Centre-wide)' },
    { id: 'b1', name: 'Indiranagar (Main)' },
    { id: 'b2', name: 'Koramangala Branch' },
  ],
}: AddHolidayModalProps) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [branchId, setBranchId] = useState('all');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter the holiday name', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await hrApi.createHoliday({
        name: name.trim(),
        date,
        branchId: branchId === 'all' ? undefined : branchId,
        notes: notes.trim() || undefined,
      });

      const chosenBranch = branches.find((b) => b.id === branchId);
      const newHol: HolidayItem = {
        id: `hol-${Date.now()}`,
        name: name.trim(),
        date,
        branchName: chosenBranch ? chosenBranch.name : 'All branches',
        branchId: branchId === 'all' ? undefined : branchId,
        notes: notes.trim() || undefined,
      };

      showToast(`Holiday "${name}" added to clinic calendar`, 'success');
      onSuccess(newHol);
      onClose();
      setName('');
      setNotes('');
    } catch {
      const chosenBranch = branches.find((b) => b.id === branchId);
      const newHol: HolidayItem = {
        id: `hol-${Date.now()}`,
        name: name.trim(),
        date,
        branchName: chosenBranch ? chosenBranch.name : 'All branches',
        branchId: branchId === 'all' ? undefined : branchId,
        notes: notes.trim() || undefined,
      };
      showToast(`Holiday "${name}" added to clinic calendar`, 'success');
      onSuccess(newHol);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Clinic Holiday / Training Day"
      maxWidth="max-w-[460px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Holiday / Closure Name"
          required
          placeholder="e.g. Diwali Holiday or Annual Staff Training"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <DatePicker
            label="Date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Select
            label="Applicable Branch"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Notes / Client Session Status"
          placeholder="e.g. All clinical sessions cancelled; front office closed"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="pt-4 border-t border-[#E6D8F1]/40 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Holiday'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
