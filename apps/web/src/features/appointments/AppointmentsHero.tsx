'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { Can } from '@/lib/permissions/Can';
import { AppModule, PermissionAction } from '@petals/types';
import { Plus, CalendarClock } from 'lucide-react';

interface AppointmentsHeroProps {
  onNewAppointment: () => void;
  onSchedulePlanning?: () => void;
}

export function AppointmentsHero({
  onNewAppointment,
  onSchedulePlanning,
}: AppointmentsHeroProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
      <div>
        <h1 className="font-quicksand font-bold text-2xl md:text-3xl text-ink tracking-tight">
          Make room for every milestone.
        </h1>
        <p className="text-sm md:text-[15px] text-gray-500 mt-1 font-medium">
          Plan sessions and keep families and therapists in sync.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <Can module={AppModule.APPOINTMENTS} action={PermissionAction.CREATE}>
          {onSchedulePlanning && (
            <Button
              type="button"
              variant="outline"
              onClick={onSchedulePlanning}
              className="flex items-center gap-1.5 h-9 px-3.5 text-xs md:text-sm font-semibold border-purple-200 text-purple-800 hover:bg-purple-50"
            >
              <CalendarClock className="w-4 h-4 text-purple-600" />
              <span>Schedule planning</span>
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            onClick={onNewAppointment}
            className="flex items-center gap-2 h-9 px-4 text-xs md:text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>New appointment</span>
          </Button>
        </Can>
      </div>
    </div>
  );
}
