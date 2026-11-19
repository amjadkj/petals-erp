import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NewLeadModal } from '../components/NewLeadModal';
import { ConvertToClientModal } from '../components/ConvertToClientModal';
import { LeadDetailDrawer } from '../components/LeadDetailDrawer';
import { leadsApi } from '@/lib/api/leads';
import { LeadStage } from '@petals/types';
import type { LeadItem } from '../types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock('@/lib/api/leads', () => ({
  leadsApi: {
    createLead: vi.fn(),
    convertLead: vi.fn(),
    getConvertPreview: vi.fn(),
    updateLead: vi.fn(),
  },
}));

vi.mock('@/lib/api/masterData', () => ({
  useBranches: () => ({
    branches: [{ id: 'branch-1', name: 'Kochi Central', code: 'KC' }],
    isLoading: false,
    error: null,
  }),
}));

const mockLead: LeadItem = {
  id: 'lead-test-1',
  branchId: 'branch-1',
  childName: 'Aarav Sharma',
  childDob: '2021-05-10',
  parentName: 'Meera Sharma',
  phone: '+91 98450 12345',
  email: 'meera@example.com',
  concerns: 'Speech and sensory needs',
  stage: LeadStage.NEW,
  notes: '[Intake] Initial notes',
  createdAt: '2026-11-01T10:00:00Z',
  updatedAt: '2026-11-01T10:00:00Z',
};

describe('Leads Modals and Detail Drawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('NewLeadModal does not have Assigned Owner and submits correctly', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    (leadsApi.createLead as any).mockResolvedValue({
      data: { ...mockLead, id: 'new-lead-id' },
    });

    render(
      <NewLeadModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />,
    );

    expect(screen.getByText('Create New Enquiry Lead')).toBeInTheDocument();
    // Assigned Owner should NOT be present
    expect(screen.queryByLabelText(/assigned owner/i)).toBeNull();

    // Fill form
    fireEvent.change(screen.getByLabelText(/child's name/i), {
      target: { value: 'Aarav Sharma' },
    });
    fireEvent.change(screen.getByLabelText(/guardian \/ parent name/i), {
      target: { value: 'Meera Sharma' },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '+91 98450 12345' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create lead/i }));

    await waitFor(() => {
      expect(leadsApi.createLead).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Aarav Sharma',
          childName: 'Aarav Sharma',
          parentName: 'Meera Sharma',
          contact: '+91 98450 12345',
          phone: '+91 98450 12345',
          branchId: 'branch-1',
        }),
      );
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('ConvertToClientModal converts with exact ConvertLeadDto payload', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    (leadsApi.getConvertPreview as any).mockResolvedValue({
      data: {
        name: 'Aarav Sharma',
        dob: '2021-05-10',
        guardianName: 'Meera Sharma',
        guardianPhone: '+91 98450 12345',
        guardianEmail: 'meera@example.com',
      },
    });

    (leadsApi.convertLead as any).mockResolvedValue({
      data: { id: 'client-123' },
    });

    render(
      <ConvertToClientModal
        lead={mockLead}
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />,
    );

    expect(screen.getByText('Convert Enquiry to Client Profile')).toBeInTheDocument();

    // Check consent checkbox
    const consentCheckbox = screen.getByRole('checkbox');
    fireEvent.click(consentCheckbox);

    const convertBtn = screen.getByRole('button', { name: /convert and create profile/i });
    expect(convertBtn).not.toBeDisabled();
    fireEvent.click(convertBtn);

    await waitFor(() => {
      expect(leadsApi.convertLead).toHaveBeenCalledWith(
        'lead-test-1',
        expect.objectContaining({
          name: 'Aarav Sharma',
          dob: '2021-05-10',
          guardianName: 'Meera Sharma',
          guardianPhone: '+91 98450 12345',
          guardianConsent: true,
        }),
      );
      expect(handleSuccess).toHaveBeenCalledWith('client-123');
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('LeadDetailDrawer has Add Note input and handles saving', async () => {
    const handleClose = vi.fn();
    const handleConvert = vi.fn();
    const handleLost = vi.fn();
    const handleFollowUp = vi.fn();
    const handleAddNote = vi.fn().mockResolvedValue(undefined);

    render(
      <LeadDetailDrawer
        lead={mockLead}
        isOpen={true}
        onClose={handleClose}
        onConvert={handleConvert}
        onMarkLost={handleLost}
        onLogFollowUp={handleFollowUp}
        onAddNote={handleAddNote}
      />,
    );

    expect(screen.getByText('Add Note / Remark')).toBeInTheDocument();
    const noteInput = screen.getByPlaceholderText(/type note about client discussion/i);
    fireEvent.change(noteInput, { target: { value: 'Parent confirmed afternoon slot.' } });

    const addNoteBtn = screen.getByRole('button', { name: /add note/i });
    fireEvent.click(addNoteBtn);

    await waitFor(() => {
      expect(handleAddNote).toHaveBeenCalledWith('lead-test-1', 'Parent confirmed afternoon slot.');
    });
  });
});
