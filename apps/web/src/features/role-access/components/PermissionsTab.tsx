'use client';

import React, { useState, useEffect } from 'react';
import { RoleKey, AppModule, PermissionAction } from '@petals/types';
import type {
  PermissionsSubTab,
  RoleDetailDto,
} from '../types';
import { RoleCardsPanel } from './RoleCardsPanel';
import { PermissionMatrixTable } from './PermissionMatrixTable';
import { PermissionMatrixAccordions } from './PermissionMatrixAccordions';
import { UserOverridesPanel } from './UserOverridesPanel';
import { accessApi } from '@/lib/api/access';
import type { UserSummary } from '@petals/types';

interface PermissionsTabProps {
  roles: RoleDetailDto[];
  users: UserSummary[];
  onRefreshRoles: () => Promise<void>;
  isLoading?: boolean;
}

export function PermissionsTab({
  roles,
  users,
  onRefreshRoles,
  isLoading = false,
}: PermissionsTabProps) {
  const [subTab, setSubTab] = useState<PermissionsSubTab>('roles');
  const [selectedRoleKey, setSelectedRoleKey] = useState<RoleKey>(RoleKey.MANAGER);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Local state for optimistic updates
  const [rolesState, setRolesState] = useState<RoleDetailDto[]>(roles);

  useEffect(() => {
    setRolesState(roles);
  }, [roles]);

  // Active role object
  const activeRole =
    rolesState.find((r) => r.key === selectedRoleKey) ||
    rolesState[0] || {
      id: 'default',
      key: selectedRoleKey,
      name: selectedRoleKey,
      description: '',
      isSystem: true,
      modules: {} as Record<AppModule, { enabled: boolean }>,
      permissions: {} as Record<AppModule, Record<PermissionAction, boolean>>,
    };

  // Optimistic update for module toggle
  const handleUpdateModule = async (module: AppModule, enabled: boolean) => {
    // 1. Optimistic state flip
    setRolesState((prev) =>
      prev.map((r) => {
        if (r.key !== activeRole.key) return r;
        return {
          ...r,
          modules: {
            ...r.modules,
            [module]: { enabled },
          },
        };
      }),
    );

    try {
      setIsSaving(true);
      await accessApi.updateRoleModules(activeRole.key, { [module]: enabled });
      setLastSavedAt(new Date());
      await onRefreshRoles();
    } catch {
      // rollback handled by refresh
      await onRefreshRoles();
    } finally {
      setIsSaving(false);
    }
  };

  // Optimistic update for single permission action toggle
  const handleUpdatePermission = async (
    module: AppModule,
    action: PermissionAction,
    allowed: boolean,
  ) => {
    // 1. Optimistic state flip
    setRolesState((prev) =>
      prev.map((r) => {
        if (r.key !== activeRole.key) return r;
        const currentModPerms = r.permissions[module] || ({} as Record<PermissionAction, boolean>);
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [module]: {
              ...currentModPerms,
              [action]: allowed,
            },
          },
        };
      }),
    );

    try {
      setIsSaving(true);
      await accessApi.updateRolePermissions(activeRole.key, {
        [module]: { [action]: allowed },
      });
      setLastSavedAt(new Date());
      await onRefreshRoles();
    } catch {
      await onRefreshRoles();
    } finally {
      setIsSaving(false);
    }
  };

  // Batch update for multiple permission action toggles
  const handleUpdatePermissionsBatch = async (
    items: Array<{ module: AppModule; action: PermissionAction; allowed: boolean }>,
  ) => {
    // 1. Optimistic state flip
    setRolesState((prev) =>
      prev.map((r) => {
        if (r.key !== activeRole.key) return r;
        const newPerms = { ...r.permissions };
        for (const item of items) {
          newPerms[item.module] = {
            ...(newPerms[item.module] || {}),
            [item.action]: item.allowed,
          };
        }
        return { ...r, permissions: newPerms };
      }),
    );

    try {
      setIsSaving(true);
      await accessApi.updateRolePermissions(activeRole.key, items);
      setLastSavedAt(new Date());
      await onRefreshRoles();
    } catch {
      await onRefreshRoles();
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && roles.length === 0) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 animate-pulse">
        <div className="w-full lg:w-80 h-96 bg-white border border-[#E6D8F1]/40 rounded-card p-4" />
        <div className="flex-1 h-96 bg-white border border-[#E6D8F1]/40 rounded-card p-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Left panel: Roles list / Subtab toggle */}
      <RoleCardsPanel
        subTab={subTab}
        onSubTabChange={setSubTab}
        selectedRoleKey={selectedRoleKey}
        onSelectRole={setSelectedRoleKey}
        roles={rolesState}
      />

      {/* Right Area */}
      {subTab === 'roles' ? (
        <div className="flex-1 w-full space-y-4">
          {/* Desktop 7-Column Table */}
          <div className="hidden md:block">
            <PermissionMatrixTable
              role={activeRole}
              onUpdateModule={handleUpdateModule}
              onUpdatePermission={handleUpdatePermission}
              onUpdatePermissionsBatch={handleUpdatePermissionsBatch}
              onResetRole={() => onRefreshRoles()}
              isSaving={isSaving}
              lastSavedAt={lastSavedAt}
            />
          </div>

          {/* Mobile Accordions */}
          <div className="md:hidden">
            <PermissionMatrixAccordions
              role={activeRole}
              onUpdateModule={handleUpdateModule}
              onUpdatePermission={handleUpdatePermission}
              onUpdatePermissionsBatch={handleUpdatePermissionsBatch}
            />
          </div>
        </div>
      ) : (
        <UserOverridesPanel users={users} roles={rolesState} />
      )}
    </div>
  );
}

