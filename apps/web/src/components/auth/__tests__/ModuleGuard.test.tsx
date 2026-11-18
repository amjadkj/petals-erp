import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModuleGuard } from '../ModuleGuard';
import { AppModule, RoleKey } from '@petals/types';

// Mock permissions store state
let mockStore = {
  permissions: {} as any,
  roleKey: null as RoleKey | null,
  isLoading: false,
};

vi.mock('@/lib/permissions/store', () => ({
  usePermissionsStore: () => mockStore,
}));

describe('ModuleGuard Component', () => {
  beforeEach(() => {
    mockStore = {
      permissions: {},
      roleKey: null,
      isLoading: false,
    };
  });

  it('renders children if user is DIRECTOR regardless of module state', () => {
    mockStore.roleKey = RoleKey.DIRECTOR;
    mockStore.permissions = {}; // No permissions explicitly mapped

    render(
      <ModuleGuard module={AppModule.FINANCIAL} moduleName="Financial">
        <div>Protected Financial Content</div>
      </ModuleGuard>,
    );

    expect(screen.getByText('Protected Financial Content')).toBeInTheDocument();
    expect(screen.queryByText(/Access Restricted/i)).not.toBeInTheDocument();
  });

  it('renders AccessRestricted if user is THERAPIST and module is not enabled', () => {
    mockStore.roleKey = RoleKey.THERAPIST;
    mockStore.permissions = {
      [AppModule.APPOINTMENTS]: { enabled: true, actions: { VIEW: true } },
      // FINANCIAL is not enabled
    };

    render(
      <ModuleGuard module={AppModule.FINANCIAL} moduleName="Financial">
        <div>Protected Financial Content</div>
      </ModuleGuard>,
    );

    expect(screen.queryByText('Protected Financial Content')).not.toBeInTheDocument();
    expect(screen.getByText('Financial Access Restricted')).toBeInTheDocument();
    expect(screen.getByText(/Return to Dashboard/i)).toBeInTheDocument();
  });

  it('renders children if user has module enabled', () => {
    mockStore.roleKey = RoleKey.THERAPIST;
    mockStore.permissions = {
      [AppModule.APPOINTMENTS]: { enabled: true, actions: { VIEW: true } },
    };

    render(
      <ModuleGuard module={AppModule.APPOINTMENTS} moduleName="Appointments">
        <div>Protected Appointments Content</div>
      </ModuleGuard>,
    );

    expect(screen.getByText('Protected Appointments Content')).toBeInTheDocument();
    expect(screen.queryByText(/Access Restricted/i)).not.toBeInTheDocument();
  });

  it('renders AccessRestricted with Director-only message when requiredRole is DIRECTOR and user is MANAGER', () => {
    mockStore.roleKey = RoleKey.MANAGER;

    render(
      <ModuleGuard requiredRole={RoleKey.DIRECTOR} moduleName="Role Access">
        <div>Director Only Governance</div>
      </ModuleGuard>,
    );

    expect(screen.queryByText('Director Only Governance')).not.toBeInTheDocument();
    expect(screen.getByText('Director Access Required')).toBeInTheDocument();
  });
});
