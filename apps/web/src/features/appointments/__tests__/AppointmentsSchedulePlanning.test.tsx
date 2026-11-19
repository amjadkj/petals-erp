import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppointmentsHero } from '../AppointmentsHero';
import { NewScheduleModal } from '@/features/schedule-planning/NewScheduleModal';
import { schedulesApi } from '@/lib/api/schedules';
import { clientsApi } from '@/lib/api/clients';

vi.mock('@/lib/api/schedules', () => ({
  schedulesApi: {
    createSchedule: vi.fn(),
  },
}));

vi.mock('@/lib/api/clients', () => ({
  clientsApi: {
    getTreatmentPlans: vi.fn(),
  },
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock('@/lib/permissions/Can', () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Appointments & Schedule Planning Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AppointmentsHero', () => {
    it('renders both Schedule planning and New appointment buttons and handles clicks', () => {
      const handleNew = vi.fn();
      const handleSchedule = vi.fn();

      render(
        <AppointmentsHero
          onNewAppointment={handleNew}
          onSchedulePlanning={handleSchedule}
        />,
      );

      const scheduleBtn = screen.getByRole('button', { name: /schedule planning/i });
      const newBtn = screen.getByRole('button', { name: /new appointment/i });

      expect(scheduleBtn).toBeDefined();
      expect(newBtn).toBeDefined();

      fireEvent.click(scheduleBtn);
      expect(handleSchedule).toHaveBeenCalledTimes(1);

      fireEvent.click(newBtn);
      expect(handleNew).toHaveBeenCalledTimes(1);
    });
  });

  describe('NewScheduleModal', () => {
    const mockClients = [
      { id: 'client-1', name: 'Aarav Patel', clientCode: 'PTL-C001' },
      { id: 'client-2', name: 'Diya Sharma', clientCode: 'PTL-C002' },
    ];

    it('displays assigned therapist and modality when client has active treatment plan', async () => {
      vi.mocked(clientsApi.getTreatmentPlans).mockResolvedValueOnce({
        data: [
          {
            id: 'plan-101',
            clientId: 'client-1',
            status: 'ACTIVE',
            sessionMinutes: 45,
            sessionsPerWeek: 2,
            department: { id: 'dept-1', name: 'Speech Therapy', code: 'ST' },
            therapist: {
              id: 'therapist-1',
              designation: 'Senior Speech Therapist',
              user: { id: 'u-1', name: 'Dr. Sarah Speech', email: 'sarah@petals.com' },
            },
          },
        ],
      } as any);

      renderWithQuery(
        <NewScheduleModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          clients={mockClients}
          initialClientId="client-1"
        />,
      );

      expect(screen.getByText('Create Recurring Schedule')).toBeDefined();
      expect(screen.getByLabelText(/select client/i)).toBeDefined();

      await waitFor(() => {
        expect(screen.getByText(/Dr\. Sarah Speech/i)).toBeDefined();
        expect(screen.getByText(/Speech Therapy/i)).toBeDefined();
        expect(screen.getByText(/Target:/i)).toBeDefined();
      });

      // Submit button should be enabled
      const submitBtn = screen.getByRole('button', { name: /create schedule/i });
      expect((submitBtn as HTMLButtonElement).disabled).toBe(false);
    });

    it('shows warning alert and disables submit when client has no active treatment plan', async () => {
      vi.mocked(clientsApi.getTreatmentPlans).mockResolvedValueOnce({
        data: [],
      } as any);

      renderWithQuery(
        <NewScheduleModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          clients={mockClients}
          initialClientId="client-2"
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(/No Active Treatment Plan Found/i)).toBeDefined();
        expect(screen.getByText(/Open Client Profile/i)).toBeDefined();
      });

      const submitBtn = screen.getByRole('button', { name: /create schedule/i });
      expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
    });

    it('submits recurring schedule and assigns to the client plan', async () => {
      vi.mocked(clientsApi.getTreatmentPlans).mockResolvedValueOnce({
        data: [
          {
            id: 'plan-101',
            clientId: 'client-1',
            status: 'ACTIVE',
            sessionMinutes: 45,
            sessionsPerWeek: 2,
            department: { id: 'dept-1', name: 'Occupational Therapy', code: 'OT' },
            therapist: {
              id: 'therapist-2',
              user: { id: 'u-2', name: 'Dr. Rajesh OT', email: 'rajesh@petals.com' },
            },
          },
        ],
      } as any);

      vi.mocked(schedulesApi.createSchedule).mockResolvedValueOnce({
        data: { generatedAppointmentsCount: 16 },
      } as any);

      const handleSuccess = vi.fn();
      const handleClose = vi.fn();

      renderWithQuery(
        <NewScheduleModal
          isOpen={true}
          onClose={handleClose}
          onSuccess={handleSuccess}
          clients={mockClients}
          initialClientId="client-1"
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(/Dr\. Rajesh OT/i)).toBeDefined();
      });

      const submitBtn = screen.getByRole('button', { name: /create schedule/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(schedulesApi.createSchedule).toHaveBeenCalledWith(
          expect.objectContaining({
            planId: 'plan-101',
            startTime: '10:00',
            durationMinutes: 45,
            recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE',
          }),
        );
        expect(handleSuccess).toHaveBeenCalled();
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });
});
