'use client';

import React, { useState } from 'react';
import { Switch } from '@/components/ui';
import { RoleKey, PermissionAction, AppModule } from '@petals/types';
import type { RoleDetailDto } from '../types';
import { MATRIX_ROWS } from '../constants';
import {
  ChevronDown,
  Check,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionMatrixAccordionsProps {
  role: RoleDetailDto;
  onUpdateModule: (module: AppModule, enabled: boolean) => Promise<void>;
  onUpdatePermission: (
    module: AppModule,
    action: PermissionAction,
    allowed: boolean,
  ) => Promise<void>;
  onUpdatePermissionsBatch?: (
    items: Array<{ module: AppModule; action: PermissionAction; allowed: boolean }>,
  ) => Promise<void>;
}

export function PermissionMatrixAccordions({
  role,
  onUpdateModule,
  onUpdatePermission,
  onUpdatePermissionsBatch,
}: PermissionMatrixAccordionsProps) {
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const isParent = role.key === RoleKey.PARENT;
  const isDirector = role.key === RoleKey.DIRECTOR;

  const actionList = [
    { action: PermissionAction.CREATE, label: 'Create' },
    { action: PermissionAction.UPDATE, label: 'Update' },
    { action: PermissionAction.VIEW, label: 'View' },
    { action: PermissionAction.VIEW_ALL, label: 'ViewAll' },
    { action: PermissionAction.DELETE, label: 'Delete' },
  ];

  const toggleAccordion = (module: AppModule) => {
    setOpenModules((prev) => ({ ...prev, [module]: !prev[module] }));
  };

  const handleModuleToggle = async (module: AppModule, nextState: boolean) => {
    if (isDirector) return;
    try {
      await onUpdateModule(module, nextState);
      if (nextState) {
        const currentPerms = role.permissions[module] || {};
        const hasAnyAction = actionList.some((col) => Boolean(currentPerms[col.action]));
        if (!hasAnyAction) {
          await onUpdatePermission(module, PermissionAction.VIEW, true);
        }
      } else {
        const clearedItems = actionList.map((col) => ({
          module,
          action: col.action,
          allowed: false,
        }));
        if (onUpdatePermissionsBatch) {
          await onUpdatePermissionsBatch(clearedItems);
        } else {
          for (const item of clearedItems) {
            await onUpdatePermission(item.module, item.action, false);
          }
        }
      }
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

    if (action === PermissionAction.VIEW && !nextVal) {
      const clearedItems = actionList.map((col) => ({
        module,
        action: col.action,
        allowed: false,
      }));

      if (onUpdatePermissionsBatch) {
        await onUpdatePermissionsBatch(clearedItems);
      } else {
        for (const item of clearedItems) {
          await onUpdatePermission(item.module, item.action, false);
        }
      }

      await onUpdateModule(module, false);
      return;
    }

    const currentPerms = role.permissions[module] || {};
    const itemsToUpdate: Array<{ module: AppModule; action: PermissionAction; allowed: boolean }> = [];

    if (action !== PermissionAction.VIEW && nextVal) {
      const hasView = currentPerms[PermissionAction.VIEW];
      if (!hasView) {
        itemsToUpdate.push({ module, action: PermissionAction.VIEW, allowed: true });
      }
    }

    itemsToUpdate.push({ module, action, allowed: nextVal });

    if (onUpdatePermissionsBatch && itemsToUpdate.length > 1) {
      await onUpdatePermissionsBatch(itemsToUpdate);
    } else {
      for (const item of itemsToUpdate) {
        await onUpdatePermission(item.module, item.action, item.allowed);
      }
    }

    const willHaveAnyAction = actionList.some((col) => {
      const updated = itemsToUpdate.find((item) => item.action === col.action);
      if (updated !== undefined) return updated.allowed;
      return Boolean(currentPerms[col.action]);
    });

    if (!willHaveAnyAction) {
      await onUpdateModule(module, false);
    } else if (!role.modules[module]?.enabled) {
      await onUpdateModule(module, true);
    }
  };

  return (
    <div className="space-y-3">
      {MATRIX_ROWS.map((row) => {
        const isModuleOn = role.modules[row.module]?.enabled ?? false;
        const permissions = role.permissions[row.module] || {};
        const isOpen = Boolean(openModules[row.module]);

        return (
          <div
            key={row.module}
            className={cn(
              'border rounded-card bg-white overflow-hidden transition-all',
              !isModuleOn ? 'border-gray-200 opacity-75' : 'border-[#E6D8F1]/60',
              row.isSubModule && 'ml-4',
            )}
          >
            {/* Accordion Header */}
            <div className="p-3.5 flex items-center justify-between gap-3 bg-gray-50/50">
              <div
                className="flex items-center gap-2 flex-1 cursor-pointer"
                onClick={() => toggleAccordion(row.module)}
              >
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-gray-400 transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
                <div>
                  <span className="font-semibold text-sm text-ink block">
                    {row.label}
                  </span>
                  {row.directorOnly && (
                    <span className="text-[10px] text-gray-400">Director only</span>
                  )}
                </div>
              </div>

              {/* Module Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">On</span>
                <Switch
                  checked={isModuleOn}
                  onChange={(checked) => handleModuleToggle(row.module, checked)}
                  disabled={isDirector || row.directorOnly}
                  id={`mob-mod-${row.module}`}
                />
              </div>
            </div>

            {/* Accordion Body: Action Checks */}
            {isOpen && (
              <div className="p-3 bg-white border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                {actionList.map((act) => {
                  if (isParent && act.action !== PermissionAction.VIEW) {
                    return null;
                  }

                  const isNotApplicable =
                    row.notApplicableActions?.includes(act.action) ||
                    (row.directorOnly && !isDirector);

                  if (isNotApplicable) {
                    return (
                      <div
                        key={act.action}
                        className="flex items-center justify-between p-2 rounded bg-gray-50 text-gray-400"
                      >
                        <span>{act.label}</span>
                        <Minus className="w-3.5 h-3.5" />
                      </div>
                    );
                  }

                  const isAllowed = Boolean(permissions[act.action]);

                  return (
                    <button
                      key={act.action}
                      type="button"
                      aria-label={`${row.label} ${act.label}`}
                      data-testid={`mob-action-${row.module}-${act.action}`}
                      disabled={isDirector || row.directorOnly}
                      onClick={() =>
                        handleActionToggle(row.module, act.action, isAllowed)
                      }
                      className={cn(
                        'flex items-center justify-between p-2 rounded border transition-all',
                        isAllowed && isModuleOn
                          ? 'bg-purple-50 border-purple-300 text-purple-800 font-medium'
                          : isAllowed && !isModuleOn
                          ? 'bg-gray-100 border-gray-200 text-gray-400'
                          : 'border-gray-200 bg-white text-gray-600',
                      )}
                    >
                      <span>{act.label}</span>
                      <div
                        className={cn(
                          'w-4 h-4 rounded flex items-center justify-center',
                          isAllowed && isModuleOn
                            ? 'bg-purple-600 text-white'
                            : isAllowed && !isModuleOn
                            ? 'bg-gray-400 text-white'
                            : 'border border-gray-300',
                        )}
                      >
                        {isAllowed && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

