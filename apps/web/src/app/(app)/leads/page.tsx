'use client';

import { usePageTitle } from '@/lib/context/PageTitleContext';

export default function LeadsPage() {
  usePageTitle('Leads');

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-6">
      <h2 className="font-quicksand font-bold text-2xl text-purple-600 mb-2">
        Leads Pipeline
      </h2>
      <p className="text-sm text-gray-500">
        Inquiry tracking, Kanban board, and client conversion flow coming in Phase B.
      </p>
    </div>
  );
}
