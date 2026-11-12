'use client';

import React from 'react';
import { StatCard } from '@/components/ui';
import { Users, UserPlus, Layers } from 'lucide-react';

interface ClientsStatsProps {
  activeCount?: number;
  newThisMonthCount?: number;
  departmentsCount?: number;
  departmentsListStr?: string;
  isLoading?: boolean;
}

export function ClientsStats({
  activeCount = 128,
  newThisMonthCount = 12,
  departmentsCount = 3,
  departmentsListStr = 'Speech · OT · Behaviour',
  isLoading = false,
}: ClientsStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label="Active clients"
        value={activeCount}
        helper="Currently receiving care"
        icon={<Users className="w-5 h-5" />}
        loading={isLoading}
      />
      <StatCard
        label="New this month"
        value={newThisMonthCount}
        helper="8 more than October"
        icon={<UserPlus className="w-5 h-5" />}
        loading={isLoading}
      />
      <StatCard
        label="Departments"
        value={departmentsCount}
        helper={departmentsListStr}
        icon={<Layers className="w-5 h-5" />}
        loading={isLoading}
      />
    </div>
  );
}
