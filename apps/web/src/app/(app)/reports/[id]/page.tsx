'use client';

import { use } from 'react';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { ReportEditor } from '@/features/reports/components/ReportEditor';

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  usePageTitle('Reports');

  return <ReportEditor reportId={id} />;
}
