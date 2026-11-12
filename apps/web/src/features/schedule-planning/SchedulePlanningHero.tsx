'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';

interface SchedulePlanningHeroProps {
  onNewSchedule: () => void;
}

export function SchedulePlanningHero({ onNewSchedule }: SchedulePlanningHeroProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
      <div>
        <h1 className="font-quicksand font-bold text-2xl md:text-3xl text-ink tracking-tight">
          Plan once. Care all term.
        </h1>
        <p className="text-sm md:text-[15px] text-gray-500 mt-1 font-medium">
          Configure recurring therapy schedules and manage clinician availability.
        </p>
      </div>

      <div>
        <Button
          type="button"
          variant="primary"
          onClick={onNewSchedule}
          className="flex items-center gap-2 h-9 px-4 text-xs md:text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>New schedule</span>
        </Button>
      </div>
    </div>
  );
}
