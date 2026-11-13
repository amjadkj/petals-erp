'use client';

import React, { useState } from 'react';
import {
  Modal,
  Button,
} from '@/components/ui';
import type { UserBranchAssignmentDto, BranchDto } from '../types';
import { branchesApi } from '@/lib/api/branches';
import { RoleKey } from '@petals/types';

interface AssignUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserBranchAssignmentDto[];
  branches: BranchDto[];
  onSuccess?: () => void;
}

export function AssignUsersModal({
  isOpen,
  onClose,
  users,
  branches,
  onSuccess,
}: AssignUsersModalProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Exclude directors (directors have all branches)
  const assignableUsers = users.filter((u) => u.roleKey !== RoleKey.DIRECTOR);

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const toggleBranch = (branchId: string) => {
    setSelectedBranchIds((prev) =>
      prev.includes(branchId) ? prev.filter((id) => id !== branchId) : [...prev, branchId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      setError('Please select at least one staff user');
      return;
    }
    if (selectedBranchIds.length === 0) {
      setError('Please select at least one branch');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Assign each selected user
      await Promise.all(
        selectedUserIds.map((userId) =>
          branchesApi.assignUserBranches(userId, {
            branchIds: selectedBranchIds,
          }),
        ),
      );

      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save assignments';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Users to Branches"
      maxWidth="max-w-[520px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-bg text-danger text-xs rounded-btn">
            {error}
          </div>
        )}

        {/* User Selection List */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink block">
            1. Select Staff Members ({selectedUserIds.length} selected)
          </label>
          <div className="max-h-40 overflow-y-auto border border-[#E6D8F1]/60 rounded-btn p-2 space-y-1 bg-white">
            {assignableUsers.map((u) => {
              const checked = selectedUserIds.includes(u.id);
              return (
                <label
                  key={u.id}
                  className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs ${
                    checked ? 'bg-purple-50 text-purple-900' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleUser(u.id)}
                    className="w-4 h-4 rounded text-purple-600 border-gray-300"
                  />
                  <span className="font-medium text-ink">{u.name}</span>
                  <span className="text-gray-400 capitalize">({u.roleKey})</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Branch Selection List */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink block">
            2. Select Branches to Assign ({selectedBranchIds.length} selected)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {branches.map((b) => {
              const checked = selectedBranchIds.includes(b.id);
              return (
                <label
                  key={b.id}
                  className={`flex items-center gap-2 p-2.5 rounded-btn border cursor-pointer text-xs transition-colors ${
                    checked
                      ? 'border-purple-600 bg-purple-50 text-purple-900 font-medium'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBranch(b.id)}
                    className="w-4 h-4 rounded text-purple-600 border-gray-300"
                  />
                  <span>
                    <strong>{b.code}</strong> · {b.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Assignments...' : 'Save Assignments'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

