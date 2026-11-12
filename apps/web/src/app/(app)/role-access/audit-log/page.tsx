'use client';

import Link from 'next/link';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { ArrowLeft } from 'lucide-react';

export default function AuditLogPage() {
  usePageTitle('Audit Log');

  return (
    <div className="space-y-4">
      <Link
        href="/role-access"
        className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to role access</span>
      </Link>

      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-6">
        <h2 className="font-quicksand font-bold text-2xl text-purple-600 mb-2">
          System Audit Log
        </h2>
        <p className="text-sm text-gray-500">
          User access and role modification audit trail coming in Phase B.
        </p>
      </div>
    </div>
  );
}
