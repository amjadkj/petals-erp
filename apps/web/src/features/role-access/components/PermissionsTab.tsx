'use client';

import React, { useState } from 'react';
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

  // Active role object
  const activeRole =
    roles.find((r) => r.key === selectedRoleKey) ||
    roles[0] || {
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

  // Optimistic update for permission action toggle
  const handleUpdatePermission = async (
    module: AppModule,
    action: PermissionAction,
    allowed: boolean,
  ) => {
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
        roles={roles}
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
            />
          </div>
        </div>
      ) : (
        <UserOverridesPanel users={users} roles={roles} />
      )}
    </div>
  );
}

