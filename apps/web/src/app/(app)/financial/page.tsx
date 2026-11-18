'use client';

import { usePageTitle } from '@/lib/context/PageTitleContext';
import { FinancialView } from '@/features/financial';
import { ModuleGuard } from '@/components/auth/ModuleGuard';
import { AppModule } from '@petals/types';

export default function FinancialPage() {
  usePageTitle('Payments');

  return (
    <ModuleGuard module={AppModule.FINANCIAL} moduleName="Financial">
      <FinancialView />
    </ModuleGuard>
  );
}
