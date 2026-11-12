'use client';

import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Users, GitBranch, Sparkles, CalendarClock } from 'lucide-react';

interface LeadsStatCardsProps {
  newThisMonth?: number;
  activePipeline?: number;
  convertedThisMonth?: number;
  followUpsDue?: number;
  overdueCount?: number;
  dueTodayCount?: number;
  isLoading?: boolean;
}

export function LeadsStatCards({
  newThisMonth = 18,
  activePipeline = 14,
  convertedThisMonth = 3,
  followUpsDue = 6,
  overdueCount = 2,
  dueTodayCount = 4,
  isLoading = false,
}: LeadsStatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="New leads this month"
        value={newThisMonth}
        helper="Fresh family enquiries"
        icon={<Users className="w-5 h-5 text-purple-600" />}
        loading={isLoading}
      />
      <StatCard
        label="Active pipeline"
        value={activePipeline}
        helper="New · Contacted · Assessment"
        icon={<GitBranch className="w-5 h-5 text-teal-700" />}
        loading={isLoading}
      />
      <StatCard
        label="Converted this month"
        value={convertedThisMonth}
        helper="New clients enrolled"
        icon={<Sparkles className="w-5 h-5 text-success" />}
        loading={isLoading}
      />
      <StatCard
        label="Follow-ups due"
        value={followUpsDue}
        helper={`${overdueCount} overdue · ${dueTodayCount} due today`}
        icon={<CalendarClock className="w-5 h-5 text-warning" />}
        loading={isLoading}
      />
    </div>
  );
}
