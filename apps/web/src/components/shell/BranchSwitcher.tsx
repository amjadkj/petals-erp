'use client';

import React, { useEffect, useState } from 'react';
import { usePermissionsStore } from '@/lib/permissions/store';
import { branchesApi } from '@/lib/api/branches';
import { Building2, ChevronDown } from 'lucide-react';
import { RoleKey, type BranchDto } from '@petals/types';

export function BranchSwitcher() {
  const { selectedBranchId, setSelectedBranchId, roleKey } = usePermissionsStore();
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    branchesApi
      .getBranches()
      .then((res) => {
        if (res?.data) {
          setBranches(res.data);
        }
      })
      .catch(() => {
        // Fallback / mock branch if offline
        setBranches([
          {
            id: 'b-kaloor',
            name: 'Kaloor Main',
            code: 'KL',
            city: 'Kochi',
            address: 'Kaloor, Kochi',
            phone: '+91 9876543210',
            timezone: 'Asia/Kolkata',
            isActive: true,
          },
          {
            id: 'b-kadavantra',
            name: 'Kadavanthra',
            code: 'KD',
            city: 'Kochi',
            address: 'Kadavanthra, Kochi',
            phone: '+91 9876543211',
            timezone: 'Asia/Kolkata',
            isActive: true,
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const isDirector = roleKey === RoleKey.DIRECTOR;

  if (loading) {
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
        {isDirector && <option value="ALL">All Branches</option>}
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
