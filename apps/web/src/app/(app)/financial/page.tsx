'use client';

import { usePageTitle } from '@/lib/context/PageTitleContext';
import { FinancialView } from '@/features/financial';

export default function FinancialPage() {
  usePageTitle('Payments');

  return <FinancialView />;
}
