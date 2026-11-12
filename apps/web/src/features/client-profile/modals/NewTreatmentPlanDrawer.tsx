'use client';

import React, { useState } from 'react';
import { Drawer, Input, Select, DatePicker, Button, useToast } from '@/components/ui';
import { clientsApi } from '@/lib/api/clients';

interface NewTreatmentPlanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSuccess: () => void;
  departments: Array<{ id: string; name: string }>;
  therapists: Array<{ id: string; name: string }>;
}

export function NewTreatmentPlanDrawer({
  isOpen,
  onClose,
  clientId,
  onSuccess,
  departments,
  therapists,
}: NewTreatmentPlanDrawerProps) {
  const { showToast } = useToast();

  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [therapistId, setTherapistId] = useState(therapists[0]?.id || '');
  const [sessionsPerWeek, setSessionsPerWeek] = useState('2');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [feePerSession, setFeePerSession] = useState('1500');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (departments.length > 0 && !departmentId) setDepartmentId(departments[0].id);
    if (therapists.length > 0 && !therapistId) setTherapistId(therapists[0].id);
  }, [departments, therapists, departmentId, therapistId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !therapistId || !startDate || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await clientsApi.createTreatmentPlan(clientId, {
        departmentId,
        therapistId,
        sessionsPerWeek: Number(sessionsPerWeek) || 1,
        sessionDurationMinutes: Number(durationMinutes) || 45,
        feePerSession: Number(feePerSession) || 0,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      });

      showToast('Treatment plan created successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to create treatment plan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deptOptions = departments.map((d) => ({ value: d.id, label: d.name }));
  const therapistOptions = therapists.map((t) => ({ value: t.id, label: t.name }));

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create Treatment Plan"
      width="max-w-[480px]"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 px-4 text-xs md:text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !departmentId || !therapistId}
            className="h-10 px-5 text-xs md:text-sm font-semibold"
          >
            {isSubmitting ? 'Creating...' : 'Create Plan'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Therapy Department"
          required
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          options={deptOptions}
        />

        <Select
          label="Primary Therapist"
          required
          value={therapistId}
          onChange={(e) => setTherapistId(e.target.value)}
          options={therapistOptions}
        />

        <div className="grid grid-cols-2 gap-3.5">
          <Input
            label="Sessions / Week"
            type="number"
            min="1"
            max="7"
            required
            value={sessionsPerWeek}
            onChange={(e) => setSessionsPerWeek(e.target.value)}
          />

          <Input
            label="Duration (Minutes)"
            type="number"
            min="15"
            step="15"
            required
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
          />
        </div>

        <Input
          label="Fee per Session (₹)"
          type="number"
          min="0"
          required
          value={feePerSession}
          onChange={(e) => setFeePerSession(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3.5">
          <DatePicker
            label="Start Date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <DatePicker
            label="End Date (Optional)"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </form>
    </Drawer>
  );
}
