'use client';

import { usePageTitle } from '@/lib/context/PageTitleContext';

export default function SchedulePlanningPage() {
  usePageTitle('Schedule Planning');

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-6">
      <h2 className="font-quicksand font-bold text-2xl text-purple-600 mb-2">
        Schedule Planning
      </h2>
      <p className="text-sm text-gray-500">
        Recurring schedule planning and slot allocation coming in Phase B.
      </p>
    </div>
  );
}
