'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export interface AccessRestrictedProps {
  title?: string;
  description?: string;
  moduleName?: string;
  backHref?: string;
}

export function AccessRestricted({
  title,
  description,
  moduleName,
  backHref = '/dashboard',
}: AccessRestrictedProps) {
  const isDashboardRestricted = moduleName?.toLowerCase() === 'dashboard';
  const effectiveBackHref = isDashboardRestricted ? '/appointments' : backHref;
  const backLabel = isDashboardRestricted ? 'Go to Appointments' : 'Return to Dashboard';

  const displayTitle = title || (moduleName ? `${moduleName} Access Restricted` : 'Access Restricted');
  const displayDesc =
    description ||
    (moduleName
      ? `The ${moduleName} module is restricted for your role. If you believe this is an error, please contact your Clinic Director.`
      : 'You do not have permission to view or manage this section. If you believe this is an error, please contact your Clinic Director.');

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-white border border-[#E6D8F1]/60 rounded-card text-center space-y-4 shadow-sm animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-danger-bg text-danger mx-auto flex items-center justify-center">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h2 className="font-quicksand font-bold text-2xl text-ink">
        {displayTitle}
      </h2>
      <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
        {displayDesc}
      </p>
      <div className="pt-2">
        <Link href={effectiveBackHref}>
          <Button variant="outline" className="flex items-center gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
