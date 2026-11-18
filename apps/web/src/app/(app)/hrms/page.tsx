'use client';

import { usePageTitle } from '@/lib/context/PageTitleContext';
import { HrmsView } from '@/features/hrms';
import { ModuleGuard } from '@/components/auth/ModuleGuard';
import { AppModule } from '@petals/types';

export default function HrmsPage() {
  usePageTitle('HRMS');

  return (
    <ModuleGuard module={AppModule.HRMS} moduleName="HRMS">
      <HrmsView />
    </ModuleGuard>
  );
}
