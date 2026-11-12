'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Switch, Button } from '@/components/ui';
import { RoleKey, PermissionAction, AppModule } from '@petals/types';
import type { RoleDetailDto } from '../types';
import { MATRIX_ROWS } from '../constants';
import {
  Check,
  RotateCcw,
  FileClock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionMatrixTableProps {
  role: RoleDetailDto;
  onUpdateModule: (module: AppModule, enabled: boolean) => Promise<void>;
  onUpdatePermission: (
    module: AppModule,
    action: PermissionAction,
    allowed: boolean,
  ) => Promise<void>;
  onResetRole?: () => void;
  isSaving?: boolean;
  lastSavedAt?: Date | null;
}

export function PermissionMatrixTable({
  role,
  onUpdateModule,
  onUpdatePermission,
  onResetRole,
  isSaving = false,
  lastSavedAt,
}: PermissionMatrixTableProps) {
  const [inlineNotice, setInlineNotice] = useState<string | null>(null);

  const isParent = role.key === RoleKey.PARENT;
  const isDirector = role.key === RoleKey.DIRECTOR;

  // Actions ordered as in the 7-column matrix: Create, Update, View, ViewAll, Delete
  const actionColumns = [
    { action: PermissionAction.CREATE, label: 'Create' },
    { action: PermissionAction.UPDATE, label: 'Update' },
    { action: PermissionAction.VIEW, label: 'View' },
    { action: PermissionAction.VIEW_ALL, label: 'ViewAll' },
    { action: PermissionAction.DELETE, label: 'Delete' },
  ];

  const handleModuleToggle = async (module: AppModule, nextState: boolean) => {
    if (isDirector) return;
    try {
      await onUpdateModule(module, nextState);
    } catch {
      // handled
    }
  };

  const handleActionToggle = async (
    module: AppModule,
    action: PermissionAction,
    currentAllowed: boolean,
  ) => {
    if (isDirector) return;
    const nextVal = !currentAllowed;

    // Rule: Turning View off clears every other action in that row
    if (action === PermissionAction.VIEW && !nextVal) {
      const rowDef = MATRIX_ROWS.find((r) => r.module === module);
      setInlineNotice(
        `${rowDef?.label ?? module}: View is off, so Create, Update, ViewAll and Delete are cleared.`,
      );

      // Disable View and clear all other actions
      await onUpdatePermission(module, PermissionAction.VIEW, false);
      await onUpdatePermission(module, PermissionAction.CREATE, false);
      await onUpdatePermission(module, PermissionAction.UPDATE, false);
      await onUpdatePermission(module, PermissionAction.VIEW_ALL, false);
      await onUpdatePermission(module, PermissionAction.DELETE, false);
      return;
    }

    // Rule: View is required for Create, Update, ViewAll, Delete
    if (action !== PermissionAction.VIEW && nextVal) {
      const hasView = role.permissions[module]?.[PermissionAction.VIEW];
      if (!hasView) {
        // Automatically enable view first
        await onUpdatePermission(module, PermissionAction.VIEW, true);
      }
    }

    await onUpdatePermission(module, action, nextVal);
  };

  return (
    <div className="flex-1 bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden flex flex-col justify-between">
      <div>
        {/* Table Card Header */}
        <div className="p-5 border-b border-[#E6D8F1]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-quicksand font-bold text-xl text-ink">
              {role.name} Permissions
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {role.description ?? 'Manage module visibility and CRUD action privileges.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onResetRole && !isDirector && (
              <Button
                variant="outline"
                onClick={onResetRole}
                className="h-8 px-3 text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset role defaults</span>
              </Button>
            )}
          </div>
        </div>

        {/* Inline Rule Notice Banner */}
        {inlineNotice && (
          <div className="mx-5 mt-4 p-3 bg-teal-50 border border-teal-200 rounded-btn flex items-center justify-between text-xs text-teal-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-teal-700 shrink-0" />
              <span>{inlineNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setInlineNotice(null)}
              className="text-xs font-semibold underline hover:text-teal-950 ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 7-Column Desktop Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-50 border-b border-[#E6D8F1]/60 h-11 text-[11px] font-semibold text-gray-600 uppercase tracking-wider select-none">
                <th className="px-5 w-64">Module</th>
                <th className="px-4 text-center w-28">Module On</th>
                {actionColumns.map((col) => (
                  <th key={col.action} className="px-4 text-center w-24">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6D8F1]/30">
              {MATRIX_ROWS.map((row) => {
                const isModuleOn = role.modules[row.module]?.enabled ?? false;
                const permissions = role.permissions[row.module] || {};

                return (
                  <tr
                    key={row.module}
                    className={cn(
                      'h-12 transition-colors',
                      !isModuleOn ? 'bg-gray-50/60 opacity-60' : 'hover:bg-purple-50/30',
                    )}
                  >
                    {/* Module Name / Sub-module Indentation */}
                    <td className="px-5">
                      <div
                        className={cn(
                          'flex items-center gap-2 text-sm',
                          row.isSubModule && 'pl-5 text-xs text-gray-600',
                          !row.isSubModule && 'font-semibold text-ink',
                        )}
                      >
                        {row.isSubModule && (
                          <span className="text-gray-300 font-mono">—</span>
                        )}
                        <span>{row.label}</span>
                        {row.directorOnly && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-normal">
                            Director only
                          </span>
                        )}
                        {row.clinicalOnly && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-normal">
                            Clinical
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Module Toggle Switch */}
                    <td className="px-4 text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={isModuleOn}
                          onChange={(checked) => handleModuleToggle(row.module, checked)}
                          disabled={isDirector || row.directorOnly}
                          id={`mod-toggle-${row.module}`}
                        />
                      </div>
                    </td>

                    {/* Action Cells: Create, Update, View, ViewAll, Delete */}
                    {actionColumns.map((col) => {
                      // Parent role only gets module on and View
                      if (isParent && col.action !== PermissionAction.VIEW) {
                        return (
                          <td key={col.action} className="px-4 text-center">
                            <span className="text-gray-300 select-none">—</span>
                          </td>
                        );
                      }

                      // Check not applicable
                      const isNotApplicable =
                        row.notApplicableActions?.includes(col.action) ||
                        (row.directorOnly && !isDirector);

                      if (isNotApplicable) {
                        return (
                          <td key={col.action} className="px-4 text-center">
                            <span className="text-gray-300 select-none">—</span>
                          </td>
                        );
                      }

                      const isAllowed = Boolean(permissions[col.action]);

                      return (
                        <td key={col.action} className="px-4 text-center">
                          <button
                            type="button"
                            disabled={isDirector || row.directorOnly}
                            onClick={() =>
                              handleActionToggle(row.module, col.action, isAllowed)
                            }
                            className={cn(
                              'w-5 h-5 mx-auto rounded flex items-center justify-center transition-all select-none',
                              isAllowed && isModuleOn
                                ? 'bg-purple-600 text-white'
                                : isAllowed && !isModuleOn
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'border border-gray-300 hover:border-purple-400 bg-white',
                            )}
                            title={
                              !isModuleOn && isAllowed
                                ? 'Saved check retained, but module is currently disabled'
                                : undefined
                            }
                          >
                            {isAllowed ? (
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : null}
                          </button>
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

      {/* Footer Autosave Status Strip */}
      <div className="p-4 bg-purple-50/50 border-t border-[#E6D8F1]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>
            Changes apply immediately · {isSaving ? 'Saving...' : lastSavedAt ? `Saved at ${lastSavedAt.toLocaleTimeString()}` : 'Saved just now'} · All updates are audit logged.
          </span>
        </div>

        <Link href="/role-access/audit-log">
          <Button
            variant="outline"
            className="h-8 px-2.5 text-xs flex items-center gap-1.5"
          >
            <FileClock className="w-3.5 h-3.5 text-purple-600" />
            <span>Audit log</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

