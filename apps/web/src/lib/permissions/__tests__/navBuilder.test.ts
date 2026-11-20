import { describe, it, expect } from 'vitest';
import { buildNav, getFirstAccessiblePath, ALL_NAV_ITEMS } from '../navBuilder';
import { AppModule, RoleKey, PermissionAction } from '@petals/types';
import type { PermissionsMap } from '../store';

describe('navBuilder', () => {
  it('returns all nav items for DIRECTOR regardless of permission map', () => {
    const emptyPerms: PermissionsMap = {} as any;
    const nav = buildNav(emptyPerms, RoleKey.DIRECTOR);
    expect(nav).toHaveLength(ALL_NAV_ITEMS.length);
    expect(nav.some((item) => item.module === AppModule.DASHBOARD)).toBe(true);
  });

  it('hides Dashboard when DASHBOARD module is disabled for non-director role', () => {
    const perms: PermissionsMap = {
      [AppModule.DASHBOARD]: {
        enabled: false,
        actions: {
          [PermissionAction.VIEW]: false,
          [PermissionAction.CREATE]: false,
          [PermissionAction.UPDATE]: false,
          [PermissionAction.VIEW_ALL]: false,
          [PermissionAction.DELETE]: false,
        },
      },
      [AppModule.APPOINTMENTS]: {
        enabled: true,
        actions: {
          [PermissionAction.VIEW]: true,
          [PermissionAction.CREATE]: true,
          [PermissionAction.UPDATE]: true,
          [PermissionAction.VIEW_ALL]: true,
          [PermissionAction.DELETE]: false,
        },
      },
    } as PermissionsMap;

    const nav = buildNav(perms, RoleKey.MANAGER);
    expect(nav.some((item) => item.module === AppModule.DASHBOARD)).toBe(false);
    expect(nav.some((item) => item.module === AppModule.APPOINTMENTS)).toBe(true);
  });

  it('shows Dashboard when DASHBOARD module is enabled for non-director role', () => {
    const perms: PermissionsMap = {
      [AppModule.DASHBOARD]: {
        enabled: true,
        actions: {
          [PermissionAction.VIEW]: true,
          [PermissionAction.CREATE]: false,
          [PermissionAction.UPDATE]: false,
          [PermissionAction.VIEW_ALL]: false,
          [PermissionAction.DELETE]: false,
        },
      },
      [AppModule.CLIENTS]: {
        enabled: true,
        actions: {
          [PermissionAction.VIEW]: true,
          [PermissionAction.CREATE]: false,
          [PermissionAction.UPDATE]: false,
          [PermissionAction.VIEW_ALL]: false,
          [PermissionAction.DELETE]: false,
        },
      },
    } as PermissionsMap;

    const nav = buildNav(perms, RoleKey.THERAPIST);
    expect(nav.some((item) => item.module === AppModule.DASHBOARD)).toBe(true);
    expect(nav.some((item) => item.module === AppModule.CLIENTS)).toBe(true);
  });

  describe('getFirstAccessiblePath', () => {
    it('returns /dashboard when Dashboard is enabled', () => {
      const perms: PermissionsMap = {
        [AppModule.DASHBOARD]: { enabled: true, actions: { [PermissionAction.VIEW]: true } as any },
        [AppModule.APPOINTMENTS]: { enabled: true, actions: { [PermissionAction.VIEW]: true } as any },
      } as PermissionsMap;

      expect(getFirstAccessiblePath(perms, RoleKey.MANAGER)).toBe('/dashboard');
    });

    it('returns next accessible module in sidebar when Dashboard is restricted', () => {
      const perms: PermissionsMap = {
        [AppModule.DASHBOARD]: { enabled: false, actions: {} as any },
        [AppModule.APPOINTMENTS]: { enabled: true, actions: { [PermissionAction.VIEW]: true } as any },
        [AppModule.CLIENTS]: { enabled: true, actions: { [PermissionAction.VIEW]: true } as any },
      } as PermissionsMap;

      // Next module after Dashboard in ALL_NAV_ITEMS is Appointments
      expect(getFirstAccessiblePath(perms, RoleKey.MANAGER)).toBe('/appointments');
    });

    it('skips disabled modules to find the first enabled module when Dashboard and Appointments are restricted', () => {
      const perms: PermissionsMap = {
        [AppModule.DASHBOARD]: { enabled: false, actions: {} as any },
        [AppModule.APPOINTMENTS]: { enabled: false, actions: {} as any },
        [AppModule.CLIENTS]: { enabled: true, actions: { [PermissionAction.VIEW]: true } as any },
      } as PermissionsMap;

      // Next module enabled is Clients
      expect(getFirstAccessiblePath(perms, RoleKey.THERAPIST)).toBe('/clients');
    });

    it('always returns /dashboard for DIRECTOR', () => {
      const emptyPerms: PermissionsMap = {} as any;
      expect(getFirstAccessiblePath(emptyPerms, RoleKey.DIRECTOR)).toBe('/dashboard');
    });
  });
});
