import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RoleCardsPanel } from '../components/RoleCardsPanel';
import { PermissionMatrixTable } from '../components/PermissionMatrixTable';
import { BranchCard } from '../components/BranchCard';
import { UserOverridesPanel } from '../components/UserOverridesPanel';
import { accessApi, normalizeRoleDetail } from '@/lib/api/access';
import { RoleKey, AppModule, PermissionAction } from '@petals/types';

vi.mock('@/lib/api/access', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/access')>();
  return {
    ...actual,
    accessApi: {
      ...actual.accessApi,
      getOverrides: vi.fn(),
      setOverrides: vi.fn(),
      clearOverride: vi.fn(),
    },
  };
});
import type { RoleDetailDto, BranchWithStatsDto } from '../types';

describe('Role Access Components', () => {
  const mockManagerRole: RoleDetailDto = {
    id: 'r-mgr',
    key: RoleKey.MANAGER,
    name: 'Manager',
    description: 'Front office, billing follow-up, HR admin and leads.',
    isSystem: true,
    modules: {
      [AppModule.DASHBOARD]: { enabled: true },
      [AppModule.APPOINTMENTS]: { enabled: true },
      [AppModule.CLIENTS]: { enabled: true },
      [AppModule.PROFILE_OVERVIEW]: { enabled: true },
      [AppModule.PROFILE_ASSESSMENT]: { enabled: false },
      [AppModule.PROFILE_PAYMENT_PLAN]: { enabled: true },
      [AppModule.PROFILE_PROGRESS]: { enabled: false },
      [AppModule.PROFILE_REPORTS]: { enabled: false },
      [AppModule.PROFILE_DOCUMENTS]: { enabled: true },
      [AppModule.PROFILE_SESSIONS]: { enabled: true },
      [AppModule.FINANCIAL]: { enabled: true },
      [AppModule.FINANCIAL_PNL]: { enabled: false },
      [AppModule.COMMUNICATION]: { enabled: true },
      [AppModule.SCHEDULE_PLANNING]: { enabled: false },
      [AppModule.HRMS]: { enabled: true },
      [AppModule.EMPLOYEES]: { enabled: true },
      [AppModule.EMPLOYEE_SALARY]: { enabled: false },
      [AppModule.LEADS]: { enabled: true },
      [AppModule.REPORTS]: { enabled: false },
      [AppModule.ROLE_ACCESS]: { enabled: false },
    },
    permissions: {
      [AppModule.DASHBOARD]: {
        [PermissionAction.VIEW]: true,
        [PermissionAction.CREATE]: false,
        [PermissionAction.UPDATE]: false,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.APPOINTMENTS]: {
        [PermissionAction.VIEW]: true,
        [PermissionAction.CREATE]: true,
        [PermissionAction.UPDATE]: true,
        [PermissionAction.VIEW_ALL]: true,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.CLIENTS]: {
        [PermissionAction.VIEW]: true,
        [PermissionAction.CREATE]: true,
        [PermissionAction.UPDATE]: true,
        [PermissionAction.VIEW_ALL]: true,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.PROFILE_OVERVIEW]: {
        [PermissionAction.VIEW]: true,
        [PermissionAction.CREATE]: false,
        [PermissionAction.UPDATE]: true,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.PROFILE_ASSESSMENT]: {
        [PermissionAction.VIEW]: false,
        [PermissionAction.CREATE]: false,
        [PermissionAction.UPDATE]: false,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.PROFILE_PAYMENT_PLAN]: {
        [PermissionAction.VIEW]: true,
        [PermissionAction.CREATE]: true,
        [PermissionAction.UPDATE]: true,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.PROFILE_PROGRESS]: {
        [PermissionAction.VIEW]: false,
        [PermissionAction.CREATE]: false,
        [PermissionAction.UPDATE]: false,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.PROFILE_REPORTS]: {
        [PermissionAction.VIEW]: false,
        [PermissionAction.CREATE]: false,
        [PermissionAction.UPDATE]: false,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.PROFILE_DOCUMENTS]: {
        [PermissionAction.VIEW]: true,
        [PermissionAction.CREATE]: true,
        [PermissionAction.UPDATE]: true,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.PROFILE_SESSIONS]: {
        [PermissionAction.VIEW]: true,
        [PermissionAction.CREATE]: true,
        [PermissionAction.UPDATE]: true,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.FINANCIAL]: {
        [PermissionAction.VIEW]: true,
        [PermissionAction.CREATE]: true,
        [PermissionAction.UPDATE]: true,
        [PermissionAction.VIEW_ALL]: true,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.FINANCIAL_PNL]: {
        [PermissionAction.VIEW]: false,
        [PermissionAction.CREATE]: false,
        [PermissionAction.UPDATE]: false,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.COMMUNICATION]: {
        [PermissionAction.VIEW]: true,
        [PermissionAction.CREATE]: true,
        [PermissionAction.UPDATE]: true,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.SCHEDULE_PLANNING]: {
        [PermissionAction.VIEW]: false,
        [PermissionAction.CREATE]: false,
        [PermissionAction.UPDATE]: false,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.HRMS]: {
        [PermissionAction.VIEW]: true,
        [PermissionAction.CREATE]: true,
        [PermissionAction.UPDATE]: true,
        [PermissionAction.VIEW_ALL]: true,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.EMPLOYEES]: {
        [PermissionAction.VIEW]: true,
        [PermissionAction.CREATE]: true,
        [PermissionAction.UPDATE]: true,
        [PermissionAction.VIEW_ALL]: true,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.EMPLOYEE_SALARY]: {
        [PermissionAction.VIEW]: false,
        [PermissionAction.CREATE]: false,
        [PermissionAction.UPDATE]: false,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.LEADS]: {
        [PermissionAction.VIEW]: true,
        [PermissionAction.CREATE]: true,
        [PermissionAction.UPDATE]: true,
        [PermissionAction.VIEW_ALL]: true,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.REPORTS]: {
        [PermissionAction.VIEW]: false,
        [PermissionAction.CREATE]: false,
        [PermissionAction.UPDATE]: false,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      },
      [AppModule.ROLE_ACCESS]: {
        [PermissionAction.VIEW]: false,
        [PermissionAction.CREATE]: false,
        [PermissionAction.UPDATE]: false,
        [PermissionAction.VIEW_ALL]: false,
        [PermissionAction.DELETE]: false,
      },
    },
  };

  it('renders RoleCardsPanel with Manager, Therapist, and Parent cards', () => {
    const onSelect = vi.fn();
    render(
      <RoleCardsPanel
        subTab="roles"
        onSubTabChange={vi.fn()}
        selectedRoleKey={RoleKey.MANAGER}
        onSelectRole={onSelect}
        roles={[mockManagerRole]}
      />,
    );

    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Therapist')).toBeInTheDocument();
    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText(/View is required/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Therapist'));
    expect(onSelect).toHaveBeenCalledWith(RoleKey.THERAPIST);
  });

  it('renders PermissionMatrixTable with 7 columns and autosave indicator', () => {
    const onUpdateModule = vi.fn().mockResolvedValue(undefined);
    const onUpdatePermission = vi.fn().mockResolvedValue(undefined);

    render(
      <PermissionMatrixTable
        role={mockManagerRole}
        onUpdateModule={onUpdateModule}
        onUpdatePermission={onUpdatePermission}
      />,
    );

    expect(screen.getByText('Manager Permissions')).toBeInTheDocument();
    expect(screen.getByText('Module')).toBeInTheDocument();
    expect(screen.getByText('Module On')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('ViewAll')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText(/Changes apply immediately/)).toBeInTheDocument();
  });

  it('renders BranchCard with stats and code', () => {
    const mockBranch: BranchWithStatsDto = {
      id: 'b-1',
      name: 'Indiranagar Centre',
      code: 'IND',
      city: 'Bengaluru',
      address: '124 100 Feet Rd',
      phone: '+919876543210',
      timezone: 'Asia/Kolkata',
      isActive: true,
      userCount: 12,
      clientCount: 75,
      roomsCount: 6,
    };

    const onManage = vi.fn();
    render(<BranchCard branch={mockBranch} onManage={onManage} />);

    expect(screen.getByText('Indiranagar Centre')).toBeInTheDocument();
    expect(screen.getByText('IND')).toBeInTheDocument();
    expect(screen.getByText('12 users')).toBeInTheDocument();
    expect(screen.getByText('75 clients')).toBeInTheDocument();
    expect(screen.getByText('6 rooms')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Manage'));
    expect(onManage).toHaveBeenCalledWith(mockBranch);
  });

  it('renders UserOverridesPanel and correctly loads overrides when backend returns object with { user, overrides }', async () => {
    vi.mocked(accessApi.getOverrides).mockResolvedValueOnce({
      data: {
        user: { id: 'u-1', name: 'John Therapist', email: 'john@petals.com' },
        overrides: [
          {
            id: 'ov-1',
            userId: 'u-1',
            module: AppModule.APPOINTMENTS,
            action: PermissionAction.CREATE,
            allowed: true,
            createdAt: '2026-11-20T00:00:00Z',
          },
        ],
      },
    } as any);

    const mockUsers = [
      {
        id: 'u-1',
        name: 'John Therapist',
        email: 'john@petals.com',
        roleKey: RoleKey.THERAPIST,
        isActive: true,
      },
    ];

    render(<UserOverridesPanel users={mockUsers as any} roles={[mockManagerRole]} />);

    // Select user from dropdown
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'u-1' } });

    // Should not throw "overrides.find is not a function"
    await screen.findByText(/1 active override\(s\)/i);
    expect(screen.getByText('John Therapist')).toBeInTheDocument();
  });

  it('reflects module toggle states and fires onUpdateModule when toggled', async () => {
    const onUpdateModule = vi.fn().mockResolvedValue(undefined);
    const onUpdatePermission = vi.fn().mockResolvedValue(undefined);

    render(
      <PermissionMatrixTable
        role={mockManagerRole}
        onUpdateModule={onUpdateModule}
        onUpdatePermission={onUpdatePermission}
      />,
    );

    // Appointments is enabled in mockManagerRole, Financial PnL is disabled
    const allSwitches = screen.getAllByRole('switch');
    const appointmentsSwitch = allSwitches.find((s) => s.id === 'mod-toggle-APPOINTMENTS');
    const financialPnlSwitch = allSwitches.find((s) => s.id === 'mod-toggle-FINANCIAL_PNL');

    expect(appointmentsSwitch).toBeDefined();
    expect(appointmentsSwitch).toHaveAttribute('aria-checked', 'true');

    expect(financialPnlSwitch).toBeDefined();
    expect(financialPnlSwitch).toHaveAttribute('aria-checked', 'false');

    // Click to toggle Appointments OFF
    fireEvent.click(appointmentsSwitch!);
    expect(onUpdateModule).toHaveBeenCalledWith(AppModule.APPOINTMENTS, false);
  });

  it('normalizeRoleDetail converts raw Prisma arrays into mapped dictionaries', () => {
    const rawRoleFromDb = {
      id: 'role-123',
      key: RoleKey.THERAPIST,
      name: 'Therapist',
      description: 'Clinical specialist',
      isSystem: true,
      modules: [
        { roleId: 'role-123', module: AppModule.CLIENTS, enabled: true },
        { roleId: 'role-123', module: AppModule.FINANCIAL_PNL, enabled: false },
      ],
      permissions: [
        { roleId: 'role-123', module: AppModule.CLIENTS, action: PermissionAction.VIEW, allowed: true },
        { roleId: 'role-123', module: AppModule.CLIENTS, action: PermissionAction.DELETE, allowed: false },
      ],
    };

    const normalized = normalizeRoleDetail(rawRoleFromDb);

    expect(normalized.modules[AppModule.CLIENTS]).toEqual({ enabled: true });
    expect(normalized.modules[AppModule.FINANCIAL_PNL]).toEqual({ enabled: false });
    expect(normalized.permissions[AppModule.CLIENTS][PermissionAction.VIEW]).toBe(true);
    expect(normalized.permissions[AppModule.CLIENTS][PermissionAction.DELETE]).toBe(false);
  });
});

