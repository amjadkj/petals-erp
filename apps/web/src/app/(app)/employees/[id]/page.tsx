'use client';

import { use } from 'react';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { EmployeeDetailView } from '@/features/employees/components/EmployeeDetailView';
import { ModuleGuard } from '@/components/auth/ModuleGuard';
import { AppModule } from '@petals/types';

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  usePageTitle('Employees');

  return (
    <ModuleGuard module={AppModule.EMPLOYEES} moduleName="Employees">
      <EmployeeDetailView employeeId={id} />
    </ModuleGuard>
  );
}
