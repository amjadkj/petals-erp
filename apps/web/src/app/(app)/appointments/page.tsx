'use client';

import { Suspense } from 'react';
import { AppointmentsView } from '@/features/appointments';
import { ModuleGuard } from '@/components/auth/ModuleGuard';
import { AppModule } from '@petals/types';

export default function AppointmentsPage() {
  return (
    <ModuleGuard module={AppModule.APPOINTMENTS} moduleName="Appointments">
      <Suspense fallback={<div className="p-6 text-sm text-gray-500 animate-pulse">Loading appointments...</div>}>
        <AppointmentsView />
      </Suspense>
    </ModuleGuard>
  );
}
