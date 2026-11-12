'use client';

import React from 'react';
import { RoleKey } from '@petals/types';
import type { PermissionsSubTab, RoleDetailDto } from '../types';
import {
  ShieldAlert,
  Check,
  Minus,
  Square,
  Lock,
} from 'lucide-react';

interface RoleCardsPanelProps {
  subTab: PermissionsSubTab;
  onSubTabChange: (tab: PermissionsSubTab) => void;
  selectedRoleKey: RoleKey;
  onSelectRole: (key: RoleKey) => void;
  roles: RoleDetailDto[];
}

export function RoleCardsPanel({
  subTab,
  onSubTabChange,
  selectedRoleKey,
  onSelectRole,
  roles,
}: RoleCardsPanelProps) {
  // Roles to display (excluding director which is always full access)
  const selectableRoles: Array<{
    key: RoleKey;
    title: string;
    description: string;
    countCaption: string;
  }> = [
    {
      key: RoleKey.MANAGER,
      title: 'Manager',
      description: 'Front office, billing follow-up, HR admin and leads.',
      countCaption: '3 team members',
    },
    {
      key: RoleKey.THERAPIST,
      title: 'Therapist',
      description: 'Clinical sessions, assessments, and client progress.',
      countCaption: '14 therapists',
    },
    {
      key: RoleKey.PARENT,
      title: 'Parent',
      description: 'Guardian view: invoices, appointments, and shared reports.',
      countCaption: '128 client families',
    },
  ];

  const getRoleCardSubtitle = (key: RoleKey) => {
    switch (key) {
      case RoleKey.MANAGER:
        return 'Operational access: Clinical content is not available to this role.';
      case RoleKey.THERAPIST:
        return 'Clinical access: Limited strictly to assigned caseloads.';
      case RoleKey.PARENT:
        return 'Guardian access: View-only access to published family milestones.';
      default:
        return '';
    }
  };

  return (
    <div className="w-full lg:w-80 shrink-0 space-y-4">
      {/* Sub tabs: Roles vs User overrides */}
      <div className="flex items-center rounded-btn bg-gray-100 p-1 border border-gray-200">
        <button
          type="button"
          onClick={() => onSubTabChange('roles')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all ${
            subTab === 'roles'
              ? 'bg-white text-purple-600 shadow-xs'
              : 'text-gray-600 hover:text-ink'
          }`}
        >
          Roles
        </button>
        <button
          type="button"
          onClick={() => onSubTabChange('overrides')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all ${
            subTab === 'overrides'
              ? 'bg-white text-purple-600 shadow-xs'
              : 'text-gray-600 hover:text-ink'
          }`}
        >
          User Overrides
        </button>
      </div>

      {subTab === 'roles' && (
        <div className="space-y-4">
          {/* Selectable Role Cards */}
          <div className="space-y-2">
            {selectableRoles.map((role) => {
              const isSelected = selectedRoleKey === role.key;
              const serverRole = roles.find((r) => r.key === role.key);
              const userCount = serverRole?.userCount;

              return (
                <div
                  key={role.key}
                  onClick={() => onSelectRole(role.key)}
                  className={`p-4 rounded-card border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white border-[#E6D8F1]/60 text-ink hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-quicksand font-bold text-base">
                      {role.title}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-chip font-medium ${
                        isSelected
                          ? 'bg-purple-800 text-purple-100'
                          : 'bg-purple-50 text-purple-700'
                      }`}
                    >
                      {userCount !== undefined ? `${userCount} users` : role.countCaption}
                    </span>
                  </div>
                  <p
                    className={`text-xs ${
                      isSelected ? 'text-purple-100' : 'text-gray-500'
                    }`}
                  >
                    {role.description}
                  </p>
                </div>
              );
            })}

            {/* Director Notice Card */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-card flex items-start gap-2.5 text-xs text-gray-500">
              <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-ink block">Director Role</span>
                Permanent super-admin with unconstrained access to all branches and modules. Not editable.
              </div>
            </div>
          </div>

          {/* How Access Works Legend Card */}
          <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-4 space-y-3 text-xs">
            <h4 className="font-semibold text-ink uppercase tracking-wider text-[11px]">
              How Access Works
            </h4>

            <div className="space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
                <span>Allowed / Enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center">
                  <Square className="w-3 h-3 text-transparent" />
                </div>
                <span>Not Granted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 text-gray-400 flex items-center justify-center">
                  <Minus className="w-4 h-4" />
                </div>
                <span>Not Applicable</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E6D8F1]/30 space-y-1.5 text-[11px] text-gray-500 leading-relaxed">
              <p>
                • <strong>View is required:</strong> Turning View off clears every other action in that row.
              </p>
              <p>
                • <strong>Module off, settings kept:</strong> Saved checks stay visible but inactive until the module is toggled on.
              </p>
              <p>
                • <strong>ViewAll needs View:</strong> Expands data scope across all caseloads; cannot be granted alone.
              </p>
            </div>
          </div>

          {/* Dynamic Role Subtitle / Footer Card */}
          <div className="p-3.5 bg-purple-50 border border-[#E6D8F1]/60 rounded-card flex items-start gap-2 text-xs text-purple-900">
            <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <div>{getRoleCardSubtitle(selectedRoleKey)}</div>
          </div>
        </div>
      )}

      {subTab === 'overrides' && (
        <div className="p-4 bg-white border border-[#E6D8F1]/60 rounded-card text-xs text-gray-500 space-y-2">
          <p className="font-semibold text-ink">User Overrides</p>
          <p>
            Grant special exceptions or restrict specific modules for individual staff members without altering the base role template.
          </p>
        </div>
      )}
    </div>
  );
}

