import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  count?: number | string;
  children?: ReactNode;
  variant?: 'teal' | 'purple' | 'danger';
  className?: string;
}

export function Badge({
  count,
  children,
  variant = 'teal',
  className,
}: BadgeProps) {
  const variantStyles = {
    teal: 'bg-teal-500 text-white',
    purple: 'bg-purple-600 text-white',
    danger: 'bg-danger text-white',
  };

  return (
    <div className="relative inline-flex items-center">
      {children}
      {count !== undefined && count !== 0 && (
        <span
          className={cn(
            'absolute -top-1.5 -right-1.5 px-1.5 py-0.2 min-w-[18px] h-[18px] text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none ring-2 ring-white',
            variantStyles[variant],
            className,
          )}
        >
          {count}
        </span>
      )}
    </div>
  );
}
