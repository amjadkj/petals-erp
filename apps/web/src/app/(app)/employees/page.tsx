'use client';

import { usePageTitle } from '@/lib/context/PageTitleContext';
import { EmployeesView } from '@/features/employees';
import { ModuleGuard } from '@/components/auth/ModuleGuard';
import { AppModule } from '@petals/types';

export default function EmployeesPage() {
  usePageTitle('Employees');

  return (
    <ModuleGuard module={AppModule.EMPLOYEES} moduleName="Employees">
      <EmployeesView />
    </ModuleGuard>
  );
}
