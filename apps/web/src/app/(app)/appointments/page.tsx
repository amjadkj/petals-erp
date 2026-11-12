'use client';

import { Suspense } from 'react';
import { AppointmentsView } from '@/features/appointments';

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500 animate-pulse">Loading appointments...</div>}>
      <AppointmentsView />
    </Suspense>
  );
}
