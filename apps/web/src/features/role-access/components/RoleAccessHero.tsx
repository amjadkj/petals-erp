'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import type { RoleAccessMainTab } from '../types';
import {
  ShieldCheck,
  Building2,
  FileClock,
  Plus,
} from 'lucide-react';

interface RoleAccessHeroProps {
  currentTab: RoleAccessMainTab;
  onTabChange: (tab: RoleAccessMainTab) => void;
  onCreateBranch?: () => void;
}

export function RoleAccessHero({
  currentTab,
  onTabChange,
  onCreateBranch,
}: RoleAccessHeroProps) {
  const isPermissions = currentTab === 'permissions';

  return (
    <div className="space-y-4 pb-6 border-b border-[#E6D8F1]/40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-btn">
              {isPermissions ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>
            <h1 className="font-quicksand font-bold text-2xl md:text-[28px] text-purple-600">
              {isPermissions ? 'Permission Manager' : 'Branch Management'}
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            {isPermissions
              ? 'Director only · Define role access and manage exceptions with confidence.'
              : 'Director only · Create branches and give each team the right location access.'}
          </p>
        </div>

        {/* Hero Actions */}
        <div className="flex items-center gap-3">
          <Link href="/role-access/audit-log">
            <Button variant="outline" className="flex items-center gap-2">
              <FileClock className="w-4 h-4 text-purple-600" />
              <span>Audit Log</span>
            </Button>
          </Link>

          {isPermissions ? (
            <Button
              variant="outline"
              onClick={() => onTabChange('branches')}
              className="flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Manage Branches</span>
            </Button>
          ) : (
            onCreateBranch && (
              <Button
                variant="primary"
                onClick={onCreateBranch}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create branch</span>
              </Button>
            )
          )}
        </div>
      </div>

      {/* Main Tab Switcher Under Hero */}
      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => onTabChange('permissions')}
          className={`px-4 py-2 text-sm font-semibold rounded-btn transition-colors ${
            isPermissions
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white border border-[#E6D8F1]/60 text-ink hover:bg-purple-50'
          }`}
        >
          Permissions Matrix
        </button>
        <button
          type="button"
          onClick={() => onTabChange('branches')}
          className={`px-4 py-2 text-sm font-semibold rounded-btn transition-colors ${
            !isPermissions
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white border border-[#E6D8F1]/60 text-ink hover:bg-purple-50'
          }`}
        >
          Branches & Locations
        </button>
      </div>
    </div>
  );
}

