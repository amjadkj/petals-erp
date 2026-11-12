'use client';

import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Users, Stethoscope, Briefcase, CalendarX } from 'lucide-react';

interface EmployeesStatCardsProps {
  teamMembers?: number;
  therapistsCount?: number;
  frontOfficeCount?: number;
  onLeaveToday?: number;
  isLoading?: boolean;
}

export function EmployeesStatCards({
  teamMembers = 18,
  therapistsCount = 14,
  frontOfficeCount = 3,
  onLeaveToday = 2,
  isLoading = false,
}: EmployeesStatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Team members"
        value={teamMembers}
        helper="Across 2 branches"
        icon={<Users className="w-5 h-5 text-purple-600" />}
        loading={isLoading}
      />
      <StatCard
        label="Therapists"
        value={therapistsCount}
        helper="6 Speech · 5 OT · 3 Behaviour"
        icon={<Stethoscope className="w-5 h-5 text-teal-700" />}
        loading={isLoading}
      />
      <StatCard
        label="Front office"
        value={frontOfficeCount}
        helper="Coordination & reception"
        icon={<Briefcase className="w-5 h-5 text-ink" />}
        loading={isLoading}
      />
      <StatCard
        label="On leave today"
        value={onLeaveToday}
        helper="16 staff members present"
        icon={<CalendarX className="w-5 h-5 text-warning" />}
        loading={isLoading}
      />
    </div>
  );
}
