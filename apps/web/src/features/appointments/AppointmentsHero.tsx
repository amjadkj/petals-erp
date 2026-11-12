'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { Can } from '@/lib/permissions/Can';
import { AppModule, PermissionAction } from '@petals/types';
import { Plus } from 'lucide-react';

interface AppointmentsHeroProps {
  onNewAppointment: () => void;
}

export function AppointmentsHero({ onNewAppointment }: AppointmentsHeroProps) {
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

      <div>
        <Can module={AppModule.APPOINTMENTS} action={PermissionAction.CREATE}>
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
