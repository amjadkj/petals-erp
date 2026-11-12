'use client';

import React, { useState } from 'react';
import type {
  BranchWithStatsDto,
  UserBranchAssignmentDto,
} from '../types';
import { BranchCard } from './BranchCard';
import { UserBranchAssignmentsTable } from './UserBranchAssignmentsTable';
import { CreateEditBranchModal } from './CreateEditBranchModal';
import { AssignUsersModal } from './AssignUsersModal';
import { EditUserBranchesModal } from './EditUserBranchesModal';
import { EmptyState } from '@/components/ui';

interface BranchesTabProps {
  branches: BranchWithStatsDto[];
  users: UserBranchAssignmentDto[];
  onRefreshData: () => Promise<void>;
  onCreateBranchModalOpen: boolean;
  onSetCreateBranchModalOpen: (open: boolean) => void;
  isLoading?: boolean;
}

export function BranchesTab({
  branches,
  users,
  onRefreshData,
  onCreateBranchModalOpen,
  onSetCreateBranchModalOpen,
  isLoading = false,
}: BranchesTabProps) {
  const [branchToManage, setBranchToManage] = useState<BranchWithStatsDto | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [userToEditBranches, setUserToEditBranches] =
    useState<UserBranchAssignmentDto | null>(null);

  return (
    <div className="space-y-8">
      {/* Branch Cards Grid (2 across on desktop) */}
      <div className="space-y-3">
        <h2 className="font-quicksand font-bold text-xl text-ink">
          Operational Branches
        </h2>

        {isLoading && branches.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            <div className="h-44 bg-white border border-[#E6D8F1]/40 rounded-card p-5" />
            <div className="h-44 bg-white border border-[#E6D8F1]/40 rounded-card p-5" />
          </div>
        ) : branches.length === 0 ? (
          <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-8">
            <EmptyState
              headline="No branches found"
              hint="Create a branch location using the '+ Create branch' button above."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((b) => (
              <BranchCard
                key={b.id}
                branch={b}
                onManage={(branch) => setBranchToManage(branch)}
              />
            ))}
          </div>
        )}
      </div>

      {/* User Branch Assignments Section */}
      <UserBranchAssignmentsTable
        users={users}
        branches={branches}
        onAssignUsers={() => setIsAssignModalOpen(true)}
        onEditUserBranches={(u) => setUserToEditBranches(u)}
        isLoading={isLoading}
      />

      {/* Create / Edit Branch Modal */}
      <CreateEditBranchModal
        isOpen={onCreateBranchModalOpen || Boolean(branchToManage)}
        onClose={() => {
          onSetCreateBranchModalOpen(false);
          setBranchToManage(null);
        }}
        branchToEdit={branchToManage}
        onSuccess={onRefreshData}
      />

      {/* Assign Users Modal */}
      <AssignUsersModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        users={users}
        branches={branches}
        onSuccess={onRefreshData}
      />

      {/* Edit Single User Branches Modal */}
      <EditUserBranchesModal
        isOpen={Boolean(userToEditBranches)}
        onClose={() => setUserToEditBranches(null)}
        user={userToEditBranches}
        branches={branches}
        onSuccess={onRefreshData}
      />
    </div>
  );
}
