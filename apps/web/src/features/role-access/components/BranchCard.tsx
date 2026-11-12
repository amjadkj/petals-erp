'use client';

import React from 'react';
import { StatusChip } from '@/components/ui';
import type { BranchWithStatsDto } from '../types';
import { Building2, Users, UserCheck, DoorOpen, MapPin, ArrowRight } from 'lucide-react';

interface BranchCardProps {
  branch: BranchWithStatsDto;
  onManage: (branch: BranchWithStatsDto) => void;
}

export function BranchCard({ branch, onManage }: BranchCardProps) {
  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 flex flex-col justify-between hover:border-purple-300 transition-colors space-y-4 shadow-2xs">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-btn">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-quicksand font-bold text-lg text-ink">
                {branch.name}
              </h3>
              <div className="text-xs text-gray-400 font-mono">
                Branch code: <strong>{branch.code}</strong>
              </div>
            </div>
          </div>

          <StatusChip status={branch.isActive ? 'active' : 'cancelled'} label={branch.isActive ? 'Active' : 'Inactive'} />
        </div>

        {/* Address */}
        <div className="text-xs text-gray-500 flex items-start gap-1.5 line-clamp-2">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <span>
            {branch.address ? `${branch.address}, ` : ''}
            {branch.city ?? 'Bengaluru'}
          </span>
        </div>
      </div>

      {/* Stats Row & Manage Button */}
      <div className="pt-3 border-t border-[#E6D8F1]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5" title="Assigned staff members">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>{branch.userCount ?? 12} users</span>
          </div>
          <div className="flex items-center gap-1.5" title="Active clients">
            <UserCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>{branch.clientCount ?? 75} clients</span>
          </div>
          <div className="flex items-center gap-1.5" title="Therapy rooms">
            <DoorOpen className="w-3.5 h-3.5 text-gray-400" />
            <span>{branch.roomsCount ?? 6} rooms</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onManage(branch)}
          className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
        >
          <span>Manage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

