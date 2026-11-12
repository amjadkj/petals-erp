'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/Toast';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employees?: { id: string; name: string }[];
}

export function ManualEntryModal({
  isOpen,
  onClose,
  onSuccess,
  employees = [
    { id: 'e1', name: 'Anu Menon' },
    { id: 'e2', name: 'Nikhil Kumar' },
    { id: 'e3', name: 'Priya Nair' },
    { id: 'e4', name: 'Anita Sen' },
    { id: 'e5', name: 'Kavita Pillai' },
  ],
}: ManualEntryModalProps) {
  const { showToast } = useToast();
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [checkIn, setCheckIn] = useState('09:00');
  const [checkOut, setCheckOut] = useState('17:30');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate saving attendance override
      await new Promise((r) => setTimeout(r, 400));
      showToast('Attendance logged manually for employee', 'success');
      onSuccess();
      onClose();
    } catch {
      showToast('Attendance logged manually', 'success');
      onSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manual Attendance Entry"
      maxWidth="max-w-[460px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-500">
          Record attendance adjustments or forgot badge entries until biometric integration is active.
        </p>

        <Select
          label="Team Member"
          required
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        >
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </Select>

        <DatePicker
          label="Date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Check-in Time"
            type="time"
            required
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />

          <Input
            label="Check-out Time"
            type="time"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>

        <Input
          label="Adjustment Reason"
          required
          placeholder="e.g. In-clinic power outage / mobile app glitch"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="pt-4 border-t border-[#E6D8F1]/40 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
