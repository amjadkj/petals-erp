import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NewAppointmentModal } from '../NewAppointmentModal';
import { appointmentsApi } from '@/lib/api/appointments';

vi.mock('@/lib/api/appointments', () => ({
  appointmentsApi: {
    createAppointment: vi.fn().mockResolvedValue({ id: 'app-1' }),
  },
}));

vi.mock('@/lib/permissions/store', () => ({
  usePermissionsStore: () => ({
    selectedBranchId: 'branch-1',
  }),
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe('NewAppointmentModal', () => {
  const mockClients = [
    { id: 'c1', name: 'Aarav Patel', clientCode: 'PTL-C001' },
    { id: 'c2', name: 'Diya Sharma', clientCode: 'PTL-C002' },
  ];

  const mockTherapists = [
    { id: 't1', name: 'Dr. Sarah OT' },
    { id: 't2', name: 'Dr. Rahul Speech' },
  ];

  it('renders without Department and Duration fields', () => {
    render(
      <NewAppointmentModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        clients={mockClients}
        therapists={mockTherapists}
      />,
    );

    expect(screen.getByText('Create New Appointment')).toBeDefined();
    expect(screen.getByLabelText(/select client/i)).toBeDefined();
    expect(screen.getByLabelText(/assigned therapist/i)).toBeDefined();
    expect(screen.getByLabelText(/date/i)).toBeDefined();
    expect(screen.getByLabelText(/start time/i)).toBeDefined();

    // Department and Duration must NOT be present
    expect(screen.queryByLabelText(/department/i)).toBeNull();
    expect(screen.queryByLabelText(/duration/i)).toBeNull();
  });

  it('initializes with prefilled therapist, time, and date', () => {
    render(
      <NewAppointmentModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        clients={mockClients}
        therapists={mockTherapists}
        prefilledTherapistId="t2"
        prefilledTime="11:30"
        prefilledDate="2026-11-20"
      />,
    );

    const therapistSelect = screen.getByLabelText(/assigned therapist/i) as HTMLSelectElement;
    expect(therapistSelect.value).toBe('t2');

    const timeSelect = screen.getByLabelText(/start time/i) as HTMLSelectElement;
    expect(timeSelect.value).toBe('11:30');

    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
    expect(dateInput.value).toBe('2026-11-20');
  });

  it('creates an appointment with standard 45-minute duration', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <NewAppointmentModal
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
        clients={mockClients}
        therapists={mockTherapists}
        prefilledClientId="c1"
        prefilledTherapistId="t1"
        prefilledTime="10:00"
        prefilledDate="2026-11-20"
      />,
    );

    const submitBtn = screen.getByRole('button', { name: /create appointment/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(appointmentsApi.createAppointment).toHaveBeenCalled();
      const callArg = (appointmentsApi.createAppointment as any).mock.calls[0][0];
      expect(callArg.branchId).toBe('branch-1');
      expect(callArg.clientId).toBe('c1');
      expect(callArg.therapistId).toBe('t1');

      const start = new Date(callArg.startsAt).getTime();
      const end = new Date(callArg.endsAt).getTime();
      expect(end - start).toBe(45 * 60 * 1000);

      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
