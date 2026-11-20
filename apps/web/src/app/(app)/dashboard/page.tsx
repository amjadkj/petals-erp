'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardView } from '@/features/dashboard';
import { ModuleGuard } from '@/components/auth/ModuleGuard';
import { AppModule, RoleKey } from '@petals/types';
import { usePermissionsStore } from '@/lib/permissions/store';
import { getFirstAccessiblePath } from '@/lib/permissions/navBuilder';

export default function DashboardPage() {
  const router = useRouter();
  const { permissions, roleKey, isLoading } = usePermissionsStore();

  useEffect(() => {
    if (!isLoading && roleKey && roleKey !== RoleKey.DIRECTOR) {
      const isDashboardEnabled = !!permissions?.[AppModule.DASHBOARD]?.enabled;
      if (!isDashboardEnabled) {
        const nextPath = getFirstAccessiblePath(permissions, roleKey);
        if (nextPath !== '/dashboard') {
          router.replace(nextPath);
        }
      }
    }
  }, [permissions, roleKey, isLoading, router]);

  return (
    <ModuleGuard module={AppModule.DASHBOARD} moduleName="Dashboard">
      <DashboardView />
    </ModuleGuard>
  );
}
