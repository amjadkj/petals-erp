'use client';

import React, { useState } from 'react';
import { Input, Select, EmptyState } from '@/components/ui';
import { AppModule, PermissionAction, RoleKey } from '@petals/types';
import type { UserOverrideDto, RoleDetailDto } from '../types';
import type { UserSummary } from '@petals/types';
import { accessApi } from '@/lib/api/access';
import { MATRIX_ROWS } from '../constants';
import {
  Search,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserOverridesPanelProps {
  users: UserSummary[];
  roles: RoleDetailDto[];
}

export function UserOverridesPanel({
  users,
  roles,
}: UserOverridesPanelProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [overrides, setOverrides] = useState<UserOverrideDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const userRole = roles.find((r) => r.key === selectedUser?.roleKey);

  const filteredUsers = users.filter((u) => {
    if (u.roleKey === RoleKey.DIRECTOR) return false;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const loadOverrides = async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await accessApi.getOverrides(userId);
      setOverrides(res.data ?? []);
    } catch {
      setOverrides([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    loadOverrides(userId);
  };

  const handleToggleOverride = async (
    module: AppModule,
    action: PermissionAction,
    currentValue: boolean,
  ) => {
    if (!selectedUserId) return;
    try {
      const nextVal = !currentValue;
      await accessApi.setOverrides(selectedUserId, [
        { module, action, allowed: nextVal },
      ]);
      setMessage(`Updated override for ${module}:${action}`);
      loadOverrides(selectedUserId);
    } catch {
      setMessage('Failed to set override');
    }
  };

  const handleClearOverride = async (
    module: AppModule,
    action: PermissionAction,
  ) => {
    if (!selectedUserId) return;
    try {
      await accessApi.clearOverride(selectedUserId, module, action);
      setMessage(`Cleared override for ${module}:${action}`);
      loadOverrides(selectedUserId);
    } catch {
      setMessage('Failed to clear override');
    }
  };

  const actionColumns = [
    { action: PermissionAction.CREATE, label: 'Create' },
    { action: PermissionAction.UPDATE, label: 'Update' },
    { action: PermissionAction.VIEW, label: 'View' },
    { action: PermissionAction.VIEW_ALL, label: 'ViewAll' },
    { action: PermissionAction.DELETE, label: 'Delete' },
  ];

  return (
    <div className="flex-1 bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-5">
      <div>
        <h2 className="font-quicksand font-bold text-xl text-ink">
          User Permission Overrides
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Select a staff member to configure individual permission overrides.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-purple-50 text-purple-800 text-xs rounded-btn flex items-center justify-between">
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* User Search & Select */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Filter staff by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leadingIcon={<Search className="w-4 h-4 text-gray-400" />}
          className="h-10 text-sm"
        />

        <Select
          value={selectedUserId}
          onChange={(e) => handleSelectUser(e.target.value)}
          className="h-10 text-sm"
          options={[
            { value: '', label: 'Select a staff member...' },
            ...filteredUsers.map((u) => ({
              value: u.id,
              label: `${u.name} (${u.roleKey}) - ${u.email}`,
            })),
          ]}
        />
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-gray-500 animate-pulse">
          Loading user overrides...
        </div>
      ) : !selectedUser ? (
        <EmptyState
          headline="No staff member selected"
          hint="Choose a staff user above to inspect their inherited role permissions and configure individual exceptions."
        />
      ) : (
        <div className="space-y-4 pt-2">
          {/* User profile strip */}
          <div className="p-3 bg-purple-50/50 border border-[#E6D8F1]/60 rounded-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                {selectedUser.name[0]}
              </div>
              <div>
                <span className="font-semibold text-sm text-ink block">
                  {selectedUser.name}
                </span>
                <span className="text-xs text-gray-500">
                  Base Role: <strong>{selectedUser.roleKey}</strong> • {overrides.length} active override(s)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-purple-800">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <span>Purple dot indicates custom override</span>
            </div>
          </div>

          {/* Overrides Table */}
          <div className="overflow-x-auto border border-[#E6D8F1]/40 rounded-card">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-purple-50 h-10 border-b border-[#E6D8F1]/40 font-semibold text-gray-600 uppercase tracking-wider text-[11px]">
                  <th className="px-4">Module</th>
                  {actionColumns.map((col) => (
                    <th key={col.action} className="px-3 text-center">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6D8F1]/30">
                {MATRIX_ROWS.map((row) => {
                  return (
                    <tr key={row.module} className="h-10 hover:bg-gray-50/50">
                      <td className="px-4 font-medium text-ink">
                        <span className={row.isSubModule ? 'pl-4 text-gray-500' : ''}>
                          {row.isSubModule ? `— ${row.label}` : row.label}
                        </span>
                      </td>

                      {actionColumns.map((col) => {
                        const isNotApplicable = row.notApplicableActions?.includes(col.action);
                        if (isNotApplicable) {
                          return (
                            <td key={col.action} className="text-center text-gray-300">
                              —
                            </td>
                          );
                        }

                        // Check if overridden
                        const override = overrides.find(
                          (o) => o.module === row.module && o.action === col.action,
                        );
                        const hasOverride = Boolean(override);

                        // Inherited role default
                        const roleDefault = Boolean(
                          userRole?.permissions[row.module]?.[col.action],
                        );

                        const effectiveAllowed = hasOverride
                          ? override?.allowed ?? false
                          : roleDefault;

                        return (
                          <td key={col.action} className="text-center px-2">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleOverride(
                                    row.module,
                                    col.action,
                                    effectiveAllowed,
                                  )
                                }
                                className={cn(
                                  'w-5 h-5 rounded flex items-center justify-center transition-all relative',
                                  effectiveAllowed
                                    ? 'bg-purple-600 text-white'
                                    : 'border border-gray-300 bg-white text-transparent',
                                )}
                              >
                                {effectiveAllowed && <Check className="w-3.5 h-3.5" />}
                                {hasOverride && (
                                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-700 ring-1 ring-white" />
                                )}
                              </button>

                              {hasOverride && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleClearOverride(row.module, col.action)
                                  }
                                  title="Clear individual override"
                                  className="text-gray-400 hover:text-danger p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
