import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddEmployeeModal } from '../components/AddEmployeeModal';
import { RoleKey } from '@petals/types';

// Mock masterData hooks
vi.mock('@/lib/api/masterData', () => ({
  useBranches: () => ({
    branches: [
      { id: 'branch-1', name: 'Indiranagar', code: 'IND', city: 'Bengaluru' },
      { id: 'branch-2', name: 'Koramangala', code: 'KOR', city: 'Bengaluru' },
    ],
    isLoading: false,
  }),
  useDepartments: () => ({
    departments: [
      { id: 'dept-1', name: 'Speech Therapy', code: 'ST' },
      { id: 'dept-2', name: 'Occupational Therapy', code: 'OT' },
    ],
    isLoading: false,
  }),
}));

// Mock Toast
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock permissions store
vi.mock('@/lib/permissions/store', () => ({
  usePermissionsStore: (selector: any) =>
    selector({
      selectedBranchId: 'branch-1',
    }),
}));

// Mock APIs
vi.mock('@/lib/api/branches', () => ({
  branchesApi: {
    getBranches: vi.fn().mockResolvedValue({
      data: [
        { id: 'branch-1', name: 'Indiranagar', code: 'IND', city: 'Bengaluru' },
        { id: 'branch-2', name: 'Koramangala', code: 'KOR', city: 'Bengaluru' },
      ],
    }),
  },
}));

vi.mock('@/lib/api/departments', () => ({
  departmentsApi: {
    getDepartments: vi.fn().mockResolvedValue({
      data: [
        { id: 'dept-1', name: 'Speech Therapy', code: 'ST' },
        { id: 'dept-2', name: 'Occupational Therapy', code: 'OT' },
      ],
    }),
  },
}));

vi.mock('@/lib/api/employees', () => ({
  employeesApi: {
    createEmployee: vi.fn().mockResolvedValue({
      data: {
        id: 'new-emp-1',
        employeeCode: 'PTL-E101',
        user: {
          id: 'user-1',
          name: 'Test Employee',
          email: 'test@petals.org',
          phone: '9845011223',
          role: { key: 'THERAPIST' },
        },
      },
    }),
  },
}));

describe('AddEmployeeModal Role & Department Dynamics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Department field when role is THERAPIST', async () => {
    render(
      <AddEmployeeModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        hasSalaryPermission={true}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Primary Branch')).toBeInTheDocument();
  });

  it('hides Department field when role is changed to MANAGER', async () => {
    render(
      <AddEmployeeModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        hasSalaryPermission={true}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    const roleSelect = screen.getByLabelText(/System Role/i);
    fireEvent.change(roleSelect, { target: { value: RoleKey.MANAGER } });

    expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
  });

  it('hides Department field and displays All Branches when role is DIRECTOR', async () => {
    render(
      <AddEmployeeModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        hasSalaryPermission={true}
      />,
    );

    const roleSelect = screen.getByLabelText(/System Role/i);
    fireEvent.change(roleSelect, { target: { value: RoleKey.DIRECTOR } });

    expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('All Branches (Full Access)')).toBeInTheDocument();
  });
});
