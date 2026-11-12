'use client';

import Link from 'next/link';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { Button } from '@/components/ui/Button';
import { History } from 'lucide-react';

export default function RoleAccessPage() {
  usePageTitle('Role Access');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-quicksand font-bold text-2xl text-purple-600">
            Role &amp; Permission Access
          </h2>
          <p className="text-xs text-gray-500">
            Configure system module permissions and user overrides.
          </p>
        </div>
        <Link href="/role-access/audit-log">
          <Button variant="outline" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <span>Audit Log</span>
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-6">
        <p className="text-sm text-gray-500">
          Role access matrix and module permission settings coming in Phase B.
        </p>
      </div>
    </div>
  );
}
