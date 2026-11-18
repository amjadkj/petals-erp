'use client';

import React, { ReactNode } from 'react';
import { AppModule, RoleKey } from '@petals/types';
import { usePermissionsStore } from '@/lib/permissions/store';
import { AccessRestricted } from '@/components/ui/AccessRestricted';

interface ModuleGuardProps {
  module?: AppModule;
  requiredRole?: RoleKey;
  moduleName?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ModuleGuard({
  module,
  requiredRole,
  moduleName,
  children,
  fallback,
}: ModuleGuardProps) {
  const { permissions, roleKey, isLoading } = usePermissionsStore();

  // Show a loading skeleton placeholder while permissions are loading
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-64 bg-white rounded-card border border-[#E6D8F1]/40" />
      </div>
    );
  }

  // Director has universal access across all modules
  if (roleKey === RoleKey.DIRECTOR) {
    return <>{children}</>;
  }

  // Check required role if specified (e.g. Director-only sections)
  if (requiredRole && roleKey !== requiredRole) {
    return (
      fallback || (
        <AccessRestricted
          title={
            requiredRole === RoleKey.DIRECTOR
              ? 'Director Access Required'
              : 'Access Restricted'
          }
          description={
            requiredRole === RoleKey.DIRECTOR
              ? `The ${moduleName || 'requested'} module is restricted strictly to clinic Directors.`
              : undefined
          }
          moduleName={moduleName}
        />
      )
    );
  }

  // Check module permission if specified
  if (module) {
    const isEnabled = !!permissions?.[module]?.enabled;
    if (!isEnabled) {
      return fallback || <AccessRestricted moduleName={moduleName} />;
    }
  }

  return <>{children}</>;
}
