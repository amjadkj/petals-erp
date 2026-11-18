'use client';

import { usePageTitle } from '@/lib/context/PageTitleContext';
import { LeadsView } from '@/features/leads';
import { ModuleGuard } from '@/components/auth/ModuleGuard';
import { AppModule } from '@petals/types';

export default function LeadsPage() {
  usePageTitle('Leads');

  return (
    <ModuleGuard module={AppModule.LEADS} moduleName="Leads">
      <LeadsView />
    </ModuleGuard>
  );
}
