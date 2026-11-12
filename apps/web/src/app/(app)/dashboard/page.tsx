'use client';

import { usePageTitle } from '@/lib/context/PageTitleContext';

export default function DashboardPage() {
  usePageTitle('Dashboard');

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-6">
        <h2 className="font-quicksand font-bold text-2xl text-purple-600 mb-2">
          Make room for every milestone.
        </h2>
        <p className="text-sm text-gray-500">
          Dashboard coming in Phase B.
        </p>
      </div>
    </div>
  );
}
