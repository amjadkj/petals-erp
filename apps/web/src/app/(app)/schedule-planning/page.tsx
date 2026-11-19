'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SchedulePlanningPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/appointments?action=schedule-planning');
  }, [router]);

  return (
    <div className="p-8 flex items-center justify-center text-sm text-gray-500 animate-pulse">
      Redirecting to Appointments Schedule Planning...
    </div>
  );
}
