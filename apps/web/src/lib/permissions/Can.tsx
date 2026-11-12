'use client';

import React, { ReactNode } from 'react';
import { AppModule, PermissionAction } from '@petals/types';
import { usePermissions } from './usePermissions';

interface CanProps {
  module: AppModule;
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
  showDisabledTooltip?: boolean;
  disabledTooltipText?: string;
}

export function Can({
  module,
  action,
  children,
  fallback = null,
  showDisabledTooltip = false,
  disabledTooltipText = 'You do not have permission for this action',
}: CanProps) {
  const { can } = usePermissions();
  const allowed = can(module, action);

  if (allowed) {
    return <>{children}</>;
  }

  if (showDisabledTooltip) {
    return (
      <span className="inline-block cursor-not-allowed opacity-50" title={disabledTooltipText}>
        {children}
      </span>
    );
  }

  return <>{fallback}</>;
}
