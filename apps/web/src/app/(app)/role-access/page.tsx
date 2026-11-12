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
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

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
      <div className="max-w-xl mx-auto mt-12 p-8 bg-white border border-[#E6D8F1]/60 rounded-card text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-danger-bg text-danger mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="font-quicksand font-bold text-2xl text-ink">
          Director Access Required
        </h2>
        <p className="text-sm text-gray-500">
          The Permission Manager and Branch Governance module is restricted strictly to clinic Directors.
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
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
