'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { RoleKey } from '@petals/types';
import {
  RoleAccessHero,
  PermissionsTab,
  BranchesTab,
} from '@/features/role-access';
import type {
  RoleAccessMainTab,
  RoleDetailDto,
  BranchWithStatsDto,
  UserBranchAssignmentDto,
} from '@/features/role-access';
import { accessApi } from '@/lib/api/access';
import { branchesApi } from '@/lib/api/branches';
import { AccessRestricted } from '@/components/ui';

export default function RoleAccessPage() {
  const { myRole } = usePermissions();
  const [currentTab, setCurrentTab] = useState<RoleAccessMainTab>('permissions');
  usePageTitle(currentTab === 'branches' ? 'Branches' : 'Role access');

  const [roles, setRoles] = useState<RoleDetailDto[]>([]);
  const [branches, setBranches] = useState<BranchWithStatsDto[]>([]);
  const [users, setUsers] = useState<UserBranchAssignmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createBranchModalOpen, setCreateBranchModalOpen] = useState(false);

  // Load roles, branches, and users
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rolesRes, branchesRes, usersRes] = await Promise.all([
        accessApi.getRoles().catch(() => ({ data: [] })),
        branchesApi.getBranches().catch(() => ({ data: [] })),
        branchesApi.getUsers().catch(() => ({ data: [] })),
      ]);

      setRoles(rolesRes.data ?? []);
      setBranches((branchesRes.data as BranchWithStatsDto[]) ?? []);
      setUsers((usersRes.data as UserBranchAssignmentDto[]) ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Director-only guard
  if (myRole && myRole !== RoleKey.DIRECTOR) {
    return (
      <AccessRestricted
        title="Director Access Required"
        description="The Permission Manager and Branch Governance module is restricted strictly to clinic Directors."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Shared Header & Tab switcher */}
      <RoleAccessHero
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onCreateBranch={() => setCreateBranchModalOpen(true)}
      />

      {/* Main Tab Content */}
      {currentTab === 'permissions' ? (
        <PermissionsTab
          roles={roles}
          users={users}
          onRefreshRoles={loadData}
          isLoading={isLoading}
        />
      ) : (
        <BranchesTab
          branches={branches}
          users={users}
          onRefreshData={loadData}
          onCreateBranchModalOpen={createBranchModalOpen}
          onSetCreateBranchModalOpen={setCreateBranchModalOpen}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
