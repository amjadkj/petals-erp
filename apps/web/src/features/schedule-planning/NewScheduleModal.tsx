'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Select, DatePicker, Button, useToast } from '@/components/ui';
import { schedulesApi } from '@/lib/api/schedules';
import { addDays, format, getDay } from 'date-fns';
import { Calendar, Repeat, Clock } from 'lucide-react';

interface NewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: Array<{ id: string; name: string; clientCode?: string }>;
  treatmentPlans: Array<{
    id: string;
    clientId: string;
    departmentName: string;
    therapistName: string;
    durationMinutes: number;
  }>;
}

const DAYS = [
  { key: 'MO', label: 'Mon', dayIndex: 1 },
  { key: 'TU', label: 'Tue', dayIndex: 2 },
  { key: 'WE', label: 'Wed', dayIndex: 3 },
  { key: 'TH', label: 'Thu', dayIndex: 4 },
  { key: 'FR', label: 'Fri', dayIndex: 5 },
  { key: 'SA', label: 'Sat', dayIndex: 6 },
  { key: 'SU', label: 'Sun', dayIndex: 0 },
];

const TIME_SLOTS = [
  '09:00', '09:45', '10:00', '10:30', '10:45', '11:15', '11:30',
  '12:00', '14:00', '14:45', '15:30', '16:00', '16:15', '17:00',
];

export function NewScheduleModal({
  isOpen,
  onClose,
  onSuccess,
  clients = [],
  treatmentPlans = [],
}: NewScheduleModalProps) {
  const { showToast } = useToast();

  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['MO', 'WE']);
  const [startTime, setStartTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [startsOn, setStartsOn] = useState(new Date().toISOString().split('T')[0]);
  const [endsOn, setEndsOn] = useState('');
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available plans for selected client
  const clientPlans = useMemo(() => {
    return treatmentPlans.filter((p) => p.clientId === selectedClientId);
  }, [treatmentPlans, selectedClientId]);

  React.useEffect(() => {
    if (clientPlans.length > 0) {
      setSelectedPlanId(clientPlans[0].id);
      setDurationMinutes(String(clientPlans[0].durationMinutes || 45));
    } else {
      setSelectedPlanId('');
    }
  }, [clientPlans]);

  const handleToggleDay = (key: string) => {
    setSelectedDays((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key],
    );
  };

  // Compute live preview of next 8 dates
  const nextDatesPreview = useMemo(() => {
    if (selectedDays.length === 0 || !startsOn) return [];
    const targetDayIndices = selectedDays.map(
      (d) => DAYS.find((day) => day.key === d)?.dayIndex ?? 1,
    );

    const dates: Date[] = [];
    let current = new Date(startsOn);

    while (dates.length < 8) {
      if (targetDayIndices.includes(getDay(current))) {
        dates.push(new Date(current));
      }
      current = addDays(current, 1);
    }

    return dates;
  }, [selectedDays, startsOn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId || selectedDays.length === 0 || !startTime || !startsOn || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setConflictError(null);

    const recurrenceRule = `FREQ=WEEKLY;BYDAY=${selectedDays.join(',')}`;

    try {
      await schedulesApi.createSchedule({
        planId: selectedPlanId,
        recurrenceRule,
        startTime,
        durationMinutes: Number(durationMinutes) || 45,
        startsOn,
        endsOn: endsOn || undefined,
      });

      showToast('24 sessions created across an 8-week rolling window!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Recurring slot conflict detected for the selected therapist or client.';
      setConflictError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.name} ${c.clientCode ? `(${c.clientCode})` : ''}`,
  }));

  const planOptions = clientPlans.map((p) => ({
    value: p.id,
    label: `${p.departmentName} · ${p.therapistName}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Recurring Schedule"
      maxWidth="max-w-[560px]"
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
            disabled={!selectedPlanId || selectedDays.length === 0 || isSubmitting}
            className="h-10 px-5 text-xs md:text-sm font-semibold"
          >
            {isSubmitting ? 'Generating...' : 'Create schedule'}
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

        {clientPlans.length === 0 && (
          <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-btn border border-amber-200 font-medium leading-relaxed">
            No active treatment plan found for this client. Please create a treatment plan first before setting up recurring schedules.
          </div>
        )}

        <Select
          label="Select Client"
          required
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          options={clientOptions}
        />

        <Select
          label="Treatment Plan"
          required
          value={selectedPlanId}
          onChange={(e) => {
            setSelectedPlanId(e.target.value);
            const found = clientPlans.find((p) => p.id === e.target.value);
            if (found) setDurationMinutes(String(found.durationMinutes));
          }}
          options={planOptions}
        />

        {/* Days of Week Chips */}
        <div className="space-y-1.5">
          <label className="text-xs md:text-sm font-medium text-ink">
            Days of the Week <span className="text-danger">*</span>
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {DAYS.map((d) => {
              const isSelected = selectedDays.includes(d.key);
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => handleToggleDay(d.key)}
                  className={`w-10 h-10 rounded-full font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-200'
                      : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Time & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            label="Start Time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
          />

          <Select
            label="Duration"
            required
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            options={[
              { value: '30', label: '30 minutes' },
              { value: '45', label: '45 minutes' },
              { value: '60', label: '60 minutes' },
            ]}
          />
        </div>

        {/* Start & End Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <DatePicker
            label="Starts On"
            required
            value={startsOn}
            onChange={(e) => setStartsOn(e.target.value)}
          />

          <DatePicker
            label="Ends On (Optional)"
            value={endsOn}
            onChange={(e) => setEndsOn(e.target.value)}
          />
        </div>

        {/* Live Preview of Next 8 Dates */}
        {nextDatesPreview.length > 0 && (
          <div className="p-3.5 bg-purple-50/40 rounded-card border border-[#E6D8F1]/60 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              <span>Preview of Next 8 Generated Sessions</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {nextDatesPreview.map((d, i) => (
                <div
                  key={i}
                  className="p-1.5 bg-white rounded border border-[#E6D8F1]/50 text-center font-medium text-ink"
                >
                  {format(d, 'EEE, dd MMM')}
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
