'use client';

import { use } from 'react';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { EmployeeDetailView } from '@/features/employees/components/EmployeeDetailView';

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  usePageTitle('Employees');

  return <EmployeeDetailView employeeId={id} />;
}
