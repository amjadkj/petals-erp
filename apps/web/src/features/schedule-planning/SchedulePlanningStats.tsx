'use client';

import React from 'react';
import { StatCard } from '@/components/ui';
import { Repeat, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SchedulePlanningStatsProps {
  activeSchedulesCount?: number;
  sessionsThisWeekCount?: number;
  conflictsCount?: number;
  affectedByLeaveCount?: number;
  isLoading?: boolean;
}

export function SchedulePlanningStats({
  activeSchedulesCount = 18,
  sessionsThisWeekCount = 48,
  conflictsCount = 0,
  affectedByLeaveCount = 3,
  isLoading = false,
}: SchedulePlanningStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Active schedules"
        value={activeSchedulesCount}
        helper="Across active branches"
        icon={<Repeat className="w-5 h-5 text-purple-600" />}
        loading={isLoading}
      />
      <StatCard
        label="Sessions generated"
        value={sessionsThisWeekCount}
        helper="8-week rolling window active"
        icon={<Calendar className="w-5 h-5 text-teal-700" />}
        loading={isLoading}
      />
      <StatCard
        label="Conflicts to resolve"
        value={conflictsCount}
        helper={conflictsCount === 0 ? 'Zero booking overlaps' : 'Action needed'}
        icon={<CheckCircle2 className="w-5 h-5 text-success" />}
        loading={isLoading}
      />
      <StatCard
        label="Sessions affected by leave"
        value={affectedByLeaveCount}
        helper="Needs rescheduling"
        icon={<AlertTriangle className="w-5 h-5 text-warning" />}
        loading={isLoading}
      />
    </div>
  );
}
