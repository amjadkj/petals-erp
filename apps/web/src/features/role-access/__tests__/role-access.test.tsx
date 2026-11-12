import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RoleCardsPanel } from '../components/RoleCardsPanel';
import { PermissionMatrixTable } from '../components/PermissionMatrixTable';
import { BranchCard } from '../components/BranchCard';
import { RoleKey, AppModule, PermissionAction } from '@petals/types';
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
});

