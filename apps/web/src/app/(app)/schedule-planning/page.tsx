'use client';

import { SchedulePlanningView } from '@/features/schedule-planning';
import { ModuleGuard } from '@/components/auth/ModuleGuard';
import { AppModule } from '@petals/types';

export default function SchedulePlanningPage() {
  return (
    <ModuleGuard module={AppModule.SCHEDULE_PLANNING} moduleName="Schedule Planning">
      <SchedulePlanningView />
    </ModuleGuard>
  );
}
