'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
} from '@/components/ui';
import type { UserBranchAssignmentDto, BranchDto } from '../types';
import { branchesApi } from '@/lib/api/branches';
import { RoleKey } from '@petals/types';

interface EditUserBranchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserBranchAssignmentDto | null;
  branches: BranchDto[];
  onSuccess?: () => void;
}

export function EditUserBranchesModal({
  isOpen,
  onClose,
  user,
  branches,
  onSuccess,
}: EditUserBranchesModalProps) {
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [primaryBranchId, setPrimaryBranchId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const bIds = user.branches?.map((b) => b.branchId) || user.branchIds || [];
      setSelectedBranchIds(bIds);
      const primary = user.branches?.find((b) => b.isPrimary)?.branchId || bIds[0] || '';
      setPrimaryBranchId(primary);
    }
  }, [user, isOpen]);

  if (!user) return null;

  const isDirector = user.roleKey === RoleKey.DIRECTOR;

  const toggleBranch = (branchId: string) => {
    setSelectedBranchIds((prev) => {
      const exists = prev.includes(branchId);
      const next = exists ? prev.filter((id) => id !== branchId) : [...prev, branchId];
      if (primaryBranchId === branchId && exists) {
        setPrimaryBranchId(next[0] || '');
      } else if (!primaryBranchId && !exists) {
        setPrimaryBranchId(branchId);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirector && selectedBranchIds.length === 0) {
      setError('Staff user must be assigned to at least one branch');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await branchesApi.assignUserBranches(user.id, {
        branchIds: selectedBranchIds,
        primaryBranchId: primaryBranchId || selectedBranchIds[0],
      });

      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update branch assignments';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Branch Access for ${user.name}`}
      maxWidth="max-w-[460px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-bg text-danger text-xs rounded-btn">
            {error}
          </div>
        )}

        <div className="p-3 bg-purple-50 rounded-btn text-xs text-purple-900 space-y-1">
          <span className="font-semibold block">{user.name}</span>
          <span className="text-gray-500 block">
            Role: <strong>{user.roleKey}</strong> • {user.email}
          </span>
          {isDirector && (
            <p className="text-purple-700 pt-1 font-medium">
              Director has unrestricted access across all current and future branches.
            </p>
          )}
        </div>

        {!isDirector && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink block">
              Authorized Branch Locations
            </label>
            <div className="space-y-1.5">
              {branches.map((b) => {
                const checked = selectedBranchIds.includes(b.id);
                const isPrimary = primaryBranchId === b.id;

                return (
                  <div
                    key={b.id}
                    className={`flex items-center justify-between p-2.5 rounded-btn border text-xs transition-colors ${
                      checked
                        ? 'border-purple-600 bg-purple-50/40 text-ink'
                        : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleBranch(b.id)}
                        className="w-4 h-4 rounded text-purple-600 border-gray-300"
                      />
                      <span className="font-medium text-ink">
                        {b.name} ({b.code})
                      </span>
                    </label>

                    {checked && (
                      <button
                        type="button"
                        onClick={() => setPrimaryBranchId(b.id)}
                        className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                          isPrimary
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isPrimary ? 'Primary' : 'Set as Primary'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {!isDirector && (
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Branch Access'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}

