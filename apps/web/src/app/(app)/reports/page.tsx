'use client';

import { usePageTitle } from '@/lib/context/PageTitleContext';

export default function ReportsPage() {
  usePageTitle('Clinical Reports');

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-6">
      <h2 className="font-quicksand font-bold text-2xl text-purple-600 mb-2">
        Clinical Reports
      </h2>
      <p className="text-sm text-gray-500">
        Assessment, progress, and discharge reports coming in Phase B.
      </p>
    </div>
  );
}
