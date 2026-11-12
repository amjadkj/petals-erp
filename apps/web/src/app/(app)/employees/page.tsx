'use client';

import { usePageTitle } from '@/lib/context/PageTitleContext';
import { EmployeesView } from '@/features/employees';

export default function EmployeesPage() {
  usePageTitle('Employees');

  return <EmployeesView />;
}
