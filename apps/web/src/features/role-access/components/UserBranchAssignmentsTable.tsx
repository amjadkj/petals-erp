'use client';

import React, { useState, useMemo } from 'react';
import {
  Button,
  Input,
  Select,
} from '@/components/ui';
import { RoleKey } from '@petals/types';
import type { UserBranchAssignmentDto, BranchDto } from '../types';
import { Search, UserPlus } from 'lucide-react';

interface UserBranchAssignmentsTableProps {
  users: UserBranchAssignmentDto[];
  branches: BranchDto[];
  onAssignUsers: () => void;
  onEditUserBranches: (user: UserBranchAssignmentDto) => void;
  isLoading?: boolean;
}

export function UserBranchAssignmentsTable({
  users,
  branches,
  onAssignUsers,
  onEditUserBranches,
  isLoading = false,
}: UserBranchAssignmentsTableProps) {
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (search) {
        const q = search.toLowerCase();
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) {
          return false;
        }
      }

      if (branchFilter) {
        const isDirector = u.roleKey === RoleKey.DIRECTOR;
        if (!isDirector) {
          const userBranchIds = u.branches?.map((b) => b.branchId) || u.branchIds || [];
          if (!userBranchIds.includes(branchFilter)) return false;
        }
      }

      return true;
    });
  }, [users, search, branchFilter]);

  const multiBranchCount = useMemo(() => {
    return users.filter((u) => {
      const bCount = u.branches?.length || u.branchIds?.length || 0;
      return bCount > 1 || u.roleKey === RoleKey.DIRECTOR;
    }).length;
  }, [users]);

  // Paginated slice
  const paginated = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
      {/* Header with Title and Assign Users button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6D8F1]/40">
        <div>
          <h2 className="font-quicksand font-bold text-xl text-ink">
            User Branch Assignments
          </h2>
          <p className="text-xs text-gray-500">
            {users.length} users total · {multiBranchCount} multi-branch authorized
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onAssignUsers}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Assign users</span>
        </Button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Search team members by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leadingIcon={<Search className="w-4 h-4 text-gray-400" />}
          className="h-10 text-sm"
        />

        <Select
          value={branchFilter}
          onChange={(e) => {
            setBranchFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 text-sm"
          options={[
            { value: '', label: 'All Branches' },
            ...branches.map((b) => ({ value: b.id, label: `${b.name} (${b.code})` })),
          ]}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-10 bg-purple-50 rounded" />
          <div className="h-12 bg-gray-100 rounded" />
          <div className="h-12 bg-gray-100 rounded" />
        </div>
      ) : (
        <div className="w-full space-y-3">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto border border-[#E6D8F1]/40 rounded-card">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-purple-50 h-11 border-b border-[#E6D8F1]/40 text-gray-600 font-semibold uppercase tracking-wider text-[11px] select-none">
                  <th className="px-4">User</th>
                  <th className="px-4">Role</th>
                  <th className="px-4">Assigned Branches</th>
                  <th className="px-4">Access Scope</th>
                  <th className="px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6D8F1]/30">
                {paginated.map((user) => {
                  const isDirector = user.roleKey === RoleKey.DIRECTOR;
                  const assignedBranchIds =
                    user.branches?.map((b) => b.branchId) || user.branchIds || [];

                  const assignedBranches = branches.filter((b) =>
                    assignedBranchIds.includes(b.id),
                  );

                  return (
                    <tr key={user.id} className="h-12 hover:bg-purple-50/30 transition-colors">
                      {/* User */}
                      <td className="px-4">
                        <div>
                          <span className="font-semibold text-ink text-sm block">
                            {user.name}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {user.email}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4">
                        <span className="font-medium text-ink capitalize">
                          {user.roleKey.toLowerCase()}
                        </span>
                      </td>

                      {/* Branches */}
                      <td className="px-4">
                        {isDirector ? (
                          <span className="px-2.5 py-0.5 rounded-chip text-xs bg-purple-100 text-purple-800 font-semibold">
                            All Branches (Super-Admin)
                          </span>
                        ) : assignedBranches.length === 0 ? (
                          <span className="text-gray-400 text-xs italic">
                            Unassigned
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {assignedBranches.map((b) => (
                              <span
                                key={b.id}
                                className="px-2 py-0.5 rounded-chip text-xs bg-purple-50 text-purple-700 font-medium border border-purple-200"
                              >
                                {b.code} · {b.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Access Scope */}
                      <td className="px-4 text-xs">
                        <span
                          className={`font-medium ${
                            isDirector ? 'text-purple-600' : 'text-gray-600'
                          }`}
                        >
                          {isDirector ? 'Full Access' : 'Role-based'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onEditUserBranches(user)}
                          className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {paginated.map((user) => {
              const isDirector = user.roleKey === RoleKey.DIRECTOR;
              const assignedBranchIds =
                user.branches?.map((b) => b.branchId) || user.branchIds || [];
              const assignedBranches = branches.filter((b) =>
                assignedBranchIds.includes(b.id),
              );

              return (
                <div
                  key={user.id}
                  className="p-4 bg-white border border-[#E6D8F1]/60 rounded-card space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-ink text-sm block">
                        {user.name}
                      </span>
                      <span className="text-gray-400 text-xs">{user.email}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-chip bg-gray-100 text-gray-700 capitalize font-medium">
                      {user.roleKey.toLowerCase()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1">
                    {isDirector ? (
                      <span className="px-2 py-0.5 rounded-chip text-xs bg-purple-100 text-purple-800 font-semibold">
                        All Branches
                      </span>
                    ) : (
                      assignedBranches.map((b) => (
                        <span
                          key={b.id}
                          className="px-2 py-0.5 rounded-chip text-xs bg-purple-50 text-purple-700 border border-purple-200"
                        >
                          {b.code}
                        </span>
                      ))
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => onEditUserBranches(user)}
                      className="text-xs font-semibold text-purple-600 underline"
                    >
                      Edit branches
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
              <span>
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredUsers.length)} of {filteredUsers.length} users
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-8 px-2 text-xs"
                >
                  Prev
                </Button>
                <span className="px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-8 px-2 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

