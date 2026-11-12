'use client';

import React from 'react';
import { StatCard } from '@/components/ui';
import { RoleKey } from '@petals/types';
import { FileClock, AlertCircle, CalendarCheck, Share2 } from 'lucide-react';

interface ReportsStatCardsProps {
  roleKey?: RoleKey | string | null;
  totalDue: number;
  totalOverdue: number;
  dueThisWeek: number;
  totalShared: number;
  draftsCount?: number;
  submittedCount?: number;
  loading?: boolean;
}

export function ReportsStatCards({
  roleKey,
  totalDue,
  totalOverdue,
  dueThisWeek,
  totalShared,
  draftsCount = 0,
  submittedCount: _submittedCount = 0,
  loading = false,
}: ReportsStatCardsProps) {
  const isTherapist = roleKey === RoleKey.THERAPIST;
  const isParent = roleKey === RoleKey.PARENT;

  if (isParent) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Shared Reports"
          value={totalShared}
          helper="Available to download"
          icon={<Share2 className="w-5 h-5" />}
          loading={loading}
        />
        <StatCard
          label="Completed Milestones"
          value={totalShared}
          helper="Signed off by therapists"
          icon={<CalendarCheck className="w-5 h-5" />}
          loading={loading}
        />
      </div>
    );
  }

  if (isTherapist) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Reports Due"
          value={totalDue}
          helper="Assigned to your caseload"
          icon={<FileClock className="w-5 h-5" />}
          loading={loading}
        />
        <StatCard
          label="Overdue"
          value={totalOverdue}
          helper={totalOverdue > 0 ? 'Requires immediate action' : 'All caught up'}
          icon={<AlertCircle className="w-5 h-5 text-danger" />}
          loading={loading}
        />
        <StatCard
          label="Drafts in Progress"
          value={draftsCount}
          helper="Saved drafts"
          icon={<CalendarCheck className="w-5 h-5" />}
          loading={loading}
        />
        <StatCard
          label="Shared with Parents"
          value={totalShared}
          helper="Delivered reports"
          icon={<Share2 className="w-5 h-5" />}
          loading={loading}
        />
      </div>
    );
  }

  // Director / Manager
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Reports Due"
        value={totalDue}
        helper="Across all therapists"
        icon={<FileClock className="w-5 h-5" />}
        loading={loading}
      />
      <StatCard
        label="Overdue"
        value={totalOverdue}
        helper={totalOverdue > 0 ? `${totalOverdue} past deadline` : 'Zero overdue'}
        icon={<AlertCircle className="w-5 h-5 text-danger" />}
        loading={loading}
      />
      <StatCard
        label="Due This Week"
        value={dueThisWeek}
        helper="Upcoming deadlines"
        icon={<CalendarCheck className="w-5 h-5" />}
        loading={loading}
      />
      <StatCard
        label="Shared with Parents"
        value={totalShared}
        helper="Final delivered reports"
        icon={<Share2 className="w-5 h-5" />}
        loading={loading}
      />
    </div>
  );
}

