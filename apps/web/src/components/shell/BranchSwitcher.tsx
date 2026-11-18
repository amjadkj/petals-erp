'use client';

import React, { useEffect } from 'react';
import { usePermissionsStore } from '@/lib/permissions/store';
import { useBranches } from '@/lib/api/masterData';
import { Building2, ChevronDown } from 'lucide-react';
import { RoleKey } from '@petals/types';

export function BranchSwitcher() {
  const { selectedBranchId, setSelectedBranchId, roleKey } = usePermissionsStore();
  const { branches, isLoading } = useBranches();

  useEffect(() => {
    if (branches.length > 0) {
      const current = usePermissionsStore.getState().selectedBranchId;
      const exists = branches.some((b) => b.id === current);
      if (!exists) {
        setSelectedBranchId(branches[0].id);
      }
    }
  }, [branches, setSelectedBranchId]);

  const isDirector = roleKey === RoleKey.DIRECTOR;

  if (isLoading && branches.length === 0) {
    return (
      <div className="h-10 w-36 bg-gray-100 rounded-btn animate-pulse flex items-center px-3" />
    );
  }

  // Single branch user: static label
  if (!isDirector && branches.length <= 1) {
    const singleName = branches[0]?.name ?? 'Petals Clinic';
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50/50 rounded-btn text-xs font-semibold text-purple-800 border border-purple-100">
        <Building2 className="w-3.5 h-3.5 text-purple-600" />
        <span className="truncate max-w-[130px]">{singleName}</span>
      </div>
    );
  }

  // Multi-branch user / Director: dropdown
  return (
    <div className="relative flex items-center">
      <div className="absolute left-3 pointer-events-none text-purple-600">
        <Building2 className="w-4 h-4" />
      </div>
      <select
        value={selectedBranchId}
        onChange={(e) => setSelectedBranchId(e.target.value)}
        aria-label="Select branch"
        className="h-10 pl-9 pr-8 text-xs md:text-sm font-medium bg-white text-ink rounded-btn border border-[#D9D4DE] hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-colors appearance-none cursor-pointer"
      >
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <div className="absolute right-2.5 pointer-events-none text-gray-400">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}
