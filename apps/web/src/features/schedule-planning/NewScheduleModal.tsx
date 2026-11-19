'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Modal, Select, DatePicker, Button, useToast } from '@/components/ui';
import { schedulesApi } from '@/lib/api/schedules';
import { clientsApi } from '@/lib/api/clients';
import { addDays, format, getDay } from 'date-fns';
import { Calendar, User, Clock, AlertCircle, ExternalLink } from 'lucide-react';

interface NewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients?: Array<{ id: string; name: string; clientCode?: string }>;
  initialClientId?: string;
  treatmentPlans?: Array<{
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
  '08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM', '11:30 AM', '12:15 PM', '02:00 PM',
  '02:45 PM', '03:30 PM', '04:30 PM', '05:15 PM',
];

export function NewScheduleModal({
  isOpen,
  onClose,
  onSuccess,
  clients = [],
  initialClientId,
  treatmentPlans = [],
}: NewScheduleModalProps) {
  const { showToast } = useToast();

  const [selectedClientId, setSelectedClientId] = useState(
    initialClientId || clients[0]?.id || '',
  );
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['MO', 'WE']);
  const [startTime, setStartTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [startsOn, setStartsOn] = useState(new Date().toISOString().split('T')[0]);
  const [endsOn, setEndsOn] = useState('');
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initialClientId when prop changes or clients load
  useEffect(() => {
    if (initialClientId) {
      setSelectedClientId(initialClientId);
    } else if (!selectedClientId && clients.length > 0) {
      setSelectedClientId(clients[0].id);
    }
  }, [initialClientId, clients, selectedClientId]);

  // Dynamically fetch treatment plans for the selected client
  const { data: treatmentPlansData, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['client-treatment-plans', selectedClientId],
    queryFn: async () => {
      if (!selectedClientId) return [];
      try {
        const res = await clientsApi.getTreatmentPlans(selectedClientId);
        return (res as any)?.data ?? res ?? [];
      } catch {
        return [];
      }
    },
    enabled: isOpen && !!selectedClientId,
    staleTime: 60 * 1000,
  });

  // Filter for active plans (or fallback to passed treatmentPlans props if provided)
  const activePlans = useMemo(() => {
    if (treatmentPlansData && Array.isArray(treatmentPlansData) && treatmentPlansData.length > 0) {
      return treatmentPlansData.filter(
        (p: any) => p.status === 'ACTIVE' || !p.status,
      );
    }
    if (treatmentPlans && treatmentPlans.length > 0) {
      return treatmentPlans.filter((p) => p.clientId === selectedClientId);
    }
    return [];
  }, [treatmentPlansData, treatmentPlans, selectedClientId]);

  // Synchronize selected plan and default duration
  useEffect(() => {
    if (activePlans.length > 0) {
      const exists = activePlans.some((p: any) => p.id === selectedPlanId);
      if (!exists) {
        setSelectedPlanId(activePlans[0].id);
        const dur =
          activePlans[0].sessionMinutes ||
          activePlans[0].sessionDurationMinutes ||
          activePlans[0].durationMinutes ||
          45;
        setDurationMinutes(String(dur));
      }
    } else {
      setSelectedPlanId('');
    }
  }, [activePlans, selectedPlanId]);

  const selectedPlan = useMemo(() => {
    return activePlans.find((p: any) => p.id === selectedPlanId) || activePlans[0] || null;
  }, [activePlans, selectedPlanId]);

  const therapistName =
    selectedPlan?.therapist?.user?.name ||
    selectedPlan?.therapistName ||
    'Assigned Therapist';

  const departmentName =
    selectedPlan?.department?.name ||
    selectedPlan?.departmentName ||
    'Therapy';

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
      const res = await schedulesApi.createSchedule({
        planId: selectedPlanId,
        recurrenceRule,
        startTime,
        durationMinutes: Number(durationMinutes) || 45,
        startsOn,
        endsOn: endsOn || undefined,
      });

      const count = (res as any)?.data?.generatedAppointmentsCount || 24;
      showToast(
        `${count} sessions generated for therapist ${therapistName}!`,
        'success',
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.message ||
        'Recurring slot conflict detected for the selected therapist or client.';
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

  const planOptions = activePlans.map((p: any) => ({
    value: p.id,
    label: `${p.department?.name || p.departmentName || 'Therapy'} — Therapist: ${
      p.therapist?.user?.name || p.therapistName || 'Assigned'
    } ${p.sessionsPerWeek ? `(${p.sessionsPerWeek} ses/wk)` : ''}`,
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
            {isSubmitting ? 'Generating sessions...' : 'Create schedule'}
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

        <Select
          label="Select Client"
          required
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          options={clientOptions}
        />

        {/* Treatment Plan & Therapist Assignment */}
        {isLoadingPlans ? (
          <div className="p-3.5 bg-gray-50 rounded-card border border-gray-100 animate-pulse text-xs text-gray-500 font-medium">
            Checking active treatment plans...
          </div>
        ) : activePlans.length === 0 ? (
          <div className="p-3.5 bg-amber-50 text-amber-900 text-xs rounded-card border border-amber-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>No Active Treatment Plan Found</span>
            </div>
            <p className="text-amber-700 leading-relaxed">
              Recurring schedules require an active treatment plan with an assigned therapist. Please create or activate a treatment plan in the client's profile first before generating recurring sessions.
            </p>
            {selectedClientId && (
              <Link
                href={`/clients/${selectedClientId}?tab=treatment-plans`}
                className="inline-flex items-center gap-1 font-semibold text-purple-700 hover:text-purple-900 underline pt-0.5"
              >
                <span>Open Client Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {activePlans.length > 1 && (
              <Select
                label="Treatment Plan"
                required
                value={selectedPlanId}
                onChange={(e) => {
                  setSelectedPlanId(e.target.value);
                  const found = activePlans.find((p: any) => p.id === e.target.value);
                  if (found) {
                    const dur =
                      found.sessionMinutes ||
                      found.sessionDurationMinutes ||
                      found.durationMinutes ||
                      45;
                    setDurationMinutes(String(dur));
                  }
                }}
                options={planOptions}
              />
            )}

            {/* Assigned Therapist Badge Card */}
            {selectedPlan && (
              <div className="p-3 bg-purple-50/60 rounded-card border border-purple-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-purple-900">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span>Assigned Therapist:</span>
                    <span className="font-bold text-ink">{therapistName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                    {departmentName}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-gray-600 text-[11px]">
                  {selectedPlan.sessionsPerWeek && (
                    <span>
                      Target: <strong>{selectedPlan.sessionsPerWeek} sessions / week</strong>
                    </span>
                  )}
                  <span>
                    Default Duration:{' '}
                    <strong>
                      {selectedPlan.sessionMinutes ||
                        selectedPlan.sessionDurationMinutes ||
                        selectedPlan.durationMinutes ||
                        45}{' '}
                      mins
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

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
