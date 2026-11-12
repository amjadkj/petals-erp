'use client';

import { usePageTitle } from '@/lib/context/PageTitleContext';
import { LeadsView } from '@/features/leads';

export default function LeadsPage() {
  usePageTitle('Leads');

  return <LeadsView />;
}
