'use client';

import { usePageTitle } from '@/lib/context/PageTitleContext';
import { HrmsView } from '@/features/hrms';

export default function HrmsPage() {
  usePageTitle('HRMS');

  return <HrmsView />;
}
