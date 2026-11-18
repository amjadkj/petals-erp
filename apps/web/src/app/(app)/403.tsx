'use client';

import { AccessRestricted } from '@/components/ui/AccessRestricted';
import { usePageTitle } from '@/lib/context/PageTitleContext';

export default function ForbiddenPage() {
  usePageTitle('Access Denied');

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <AccessRestricted />
    </div>
  );
}
